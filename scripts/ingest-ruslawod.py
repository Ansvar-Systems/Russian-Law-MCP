#!/usr/bin/env python3
"""
Russian Law MCP — Full Census & Ingestion from RusLawOD Dataset

Uses DuckDB to efficiently query 11 remote parquet files on Hugging Face,
extracting only federal legislation (filtering ~12K laws from 304K documents)
without downloading the full 6GB dataset.

RusLawOD: https://huggingface.co/datasets/irlspbru/RusLawOD
Paper: https://arxiv.org/abs/2406.04855

Usage:
  python3 scripts/ingest-ruslawod.py              # Full ingestion
  python3 scripts/ingest-ruslawod.py --census-only # Census only (no text parsing)
  python3 scripts/ingest-ruslawod.py --batch 1     # Process only parquet batch 1
"""

import json
import os
import re
import sys
import time
import hashlib
from pathlib import Path
from typing import Optional

try:
    import duckdb
except ImportError:
    print("ERROR: duckdb not installed. Run: pip3 install duckdb")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
SEED_DIR = DATA_DIR / "seed"
CENSUS_PATH = DATA_DIR / "census.json"

# ---------------------------------------------------------------------------
# RusLawOD remote parquet files
# ---------------------------------------------------------------------------

HF_BASE = "https://huggingface.co/datasets/irlspbru/RusLawOD/resolve/main"
PARQUET_FILES = [f"{HF_BASE}/ruslawod_{i:02d}.parquet" for i in range(1, 12)]

# SQL filter for federal legislation
FEDERAL_FILTER = """
    doc_typeIPS IN ('Федеральный закон', 'Кодекс', 'Закон',
                    'Федеральный конституционный закон', 'Конституция',
                    'Закон Российской Федерации о поправке к Конституции Российской Федерации')
    OR docNumberIPS LIKE '%ФКЗ%'
    OR docNumberIPS LIKE '%ФЗ%'
    OR issuedByIPS LIKE 'Федеральный закон%'
    OR issuedByIPS LIKE 'Федеральный конституционный закон%'
    OR headingIPS LIKE '%Конституция Российской Федерации%'
"""

# ---------------------------------------------------------------------------
# Text cleaning
# ---------------------------------------------------------------------------

REF_TAG_PATTERN = re.compile(r'<ref\s+nd="[^"]*">\s*', re.IGNORECASE)
REF_CLOSE_PATTERN = re.compile(r'\s*</ref>', re.IGNORECASE)
HTML_TAG_PATTERN = re.compile(r'<[^>]+>')

# Article patterns (mirrors parser.ts)
ARTICLE_PATTERN = re.compile(r'^\s*Статья\s+(\d+(?:\.\d+)?)\.\s*(.*)')
ARTICLE_PATTERN_ALT = re.compile(r'^\s*Статья\s+(\d+(?:\.\d+)?)\b[\.\s]*(.*)')
CHAPTER_PATTERN = re.compile(r'^\s*(Глава|Раздел|Часть|Подраздел)\s+[\dIVXLCDM]+', re.IGNORECASE)
APPENDIX_PATTERN = re.compile(r'^\s*Приложение\b', re.IGNORECASE)


def clean_text(text: str) -> str:
    """Remove ref tags and normalize whitespace."""
    if not text:
        return ""
    text = REF_TAG_PATTERN.sub("", text)
    text = REF_CLOSE_PATTERN.sub("", text)
    text = HTML_TAG_PATTERN.sub("", text)
    text = text.replace("\u00A0", " ").replace("\u2003", " ").replace("\u2002", " ")
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# ---------------------------------------------------------------------------
# Article parser
# ---------------------------------------------------------------------------

def parse_articles(text: str) -> list[dict]:
    """Parse Russian law text into article-level provisions."""
    provisions = []
    lines = text.split("\n")
    current_num = ""
    current_title = ""
    current_content = []
    order_index = 0
    in_appendix = False

    def flush():
        nonlocal current_num, current_title, current_content, order_index
        if current_num and current_content:
            content = "\n".join(current_content).strip()
            content = re.sub(r'\n{3,}', '\n\n', content)
            if content:
                provisions.append({
                    "article": current_num,
                    "title": current_title,
                    "content": content,
                    "provision_ref": current_num,
                    "order_index": order_index,
                })
                order_index += 1
        current_num = ""
        current_title = ""
        current_content = []

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            if current_num and current_content:
                current_content.append("")
            continue

        if APPENDIX_PATTERN.match(line):
            in_appendix = True
            flush()
            continue

        if in_appendix:
            m = ARTICLE_PATTERN.match(line) or ARTICLE_PATTERN_ALT.match(line)
            if m:
                in_appendix = False
            else:
                continue

        m = ARTICLE_PATTERN.match(line) or ARTICLE_PATTERN_ALT.match(line)
        if m:
            flush()
            current_num = m.group(1)
            rest = m.group(2).strip()
            if rest:
                if len(rest) < 200 and not re.match(r'^\d+\.\s', rest):
                    current_title = rest
                else:
                    current_content.append(rest)
            continue

        if CHAPTER_PATTERN.match(line):
            continue

        if current_num:
            current_content.append(line)

    flush()

    # Deduplicate
    seen = {}
    deduped = []
    for prov in provisions:
        key = prov["article"]
        if key in seen:
            deduped[seen[key]]["content"] += "\n\n" + prov["content"]
        else:
            seen[key] = len(deduped)
            deduped.append(dict(prov))

    for i, p in enumerate(deduped):
        p["order_index"] = i

    return deduped


# ---------------------------------------------------------------------------
# ID generation
# ---------------------------------------------------------------------------

CODE_SLUGS = {
    "гражданский кодекс": "gk-rf",
    "уголовный кодекс": "uk-rf",
    "трудовой кодекс": "tk-rf",
    "налоговый кодекс": "nk-rf",
    "кодекс об административных правонарушениях": "koap-rf",
    "административных правонарушениях": "koap-rf",
    "арбитражный процессуальный": "apk-rf",
    "гражданский процессуальный": "gpk-rf",
    "уголовно-процессуальный": "upk-rf",
    "уголовно-исполнительный": "uik-rf",
    "бюджетный кодекс": "bk-rf",
    "земельный кодекс": "zk-rf",
    "водный кодекс": "vk-rf",
    "лесной кодекс": "lk-rf",
    "воздушный кодекс": "vozk-rf",
    "жилищный кодекс": "zhk-rf",
    "семейный кодекс": "sk-rf",
    "таможенный кодекс": "tamk-rf",
    "градостроительный кодекс": "grk-rf",
    "кодекс торгового мореплавания": "ktm-rf",
    "кодекс внутреннего водного транспорта": "kvvt-rf",
    "кодекс административного судопроизводства": "kas-rf",
}


def make_code_slug(heading: str) -> str:
    heading_lower = heading.lower()
    for pattern, slug in CODE_SLUGS.items():
        if pattern in heading_lower:
            part_match = re.search(r'часть\s+(перв|втор|трет|четверт|первая|вторая|третья|четвёртая|1|2|3|4)', heading_lower)
            if part_match:
                part_text = part_match.group(1)
                part_num = {"перв": "1", "первая": "1", "1": "1",
                           "втор": "2", "вторая": "2", "2": "2",
                           "трет": "3", "третья": "3", "3": "3",
                           "четверт": "4", "четвёртая": "4", "4": "4"}.get(part_text, "")
                if part_num:
                    return f"{slug}-{part_num}"
            return slug
    h = hashlib.md5(heading.encode()).hexdigest()[:6]
    return f"code-{h}"


def make_law_id(doc_number: str, date_str: str, heading: str, doc_type: str) -> str:
    doc_number = (doc_number or "").strip()
    year = ""
    if date_str:
        parts = date_str.split(".")
        if len(parts) == 3:
            year = parts[2]

    heading_lower = (heading or "").lower()

    if "конституция российской федерации" in heading_lower and doc_type in ("Конституция", ""):
        return "constitution-rf"

    fkz_match = re.match(r'^(\d+)-?ФКЗ$', doc_number, re.IGNORECASE)
    if fkz_match:
        return f"fkz-{fkz_match.group(1)}-{year}" if year else f"fkz-{fkz_match.group(1)}"

    fz_match = re.match(r'^(\d+)-?ФЗ$', doc_number, re.IGNORECASE)
    if fz_match:
        return f"fz-{fz_match.group(1)}-{year}" if year else f"fz-{fz_match.group(1)}"

    if doc_type == "Кодекс":
        return make_code_slug(heading)

    if doc_type == "Закон Российской Федерации о поправке к Конституции Российской Федерации":
        num = re.match(r'^(\d+)-?ФКЗ$', doc_number)
        if num:
            return f"const-amendment-{num.group(1)}-{year}" if year else f"const-amendment-{num.group(1)}"
        return f"const-amendment-{year}" if year else f"const-amendment-{hashlib.md5(heading.encode()).hexdigest()[:6]}"

    # Fallback
    raw = f"{doc_number}_{date_str}_{heading[:50]}"
    h = hashlib.md5(raw.encode()).hexdigest()[:8]
    return f"law-{h}"


def map_status(status_ips: str) -> str:
    if not status_ips:
        return "in_force"
    s = status_ips.lower().strip()
    if "утратил силу" in s:
        return "repealed"
    if "с изменениями" in s or "c изменениями" in s:
        return "amended"
    return "in_force"


def map_law_type(doc_type: str, doc_number: str, issued_by: str, heading: str) -> str:
    doc_number = (doc_number or "").strip()
    heading_lower = (heading or "").lower()

    if "конституция российской федерации" in heading_lower:
        return "constitution"
    if doc_type == "Кодекс":
        return "code"
    if "ФКЗ" in doc_number or doc_type == "Федеральный конституционный закон":
        return "federal_constitutional_law"
    if doc_type == "Закон Российской Федерации о поправке к Конституции Российской Федерации":
        return "constitutional_amendment"
    if doc_type in ("Федеральный закон", "Закон") or "ФЗ" in doc_number:
        return "federal_law"
    return "federal_law"


def parse_date(date_str: str) -> Optional[str]:
    if not date_str:
        return None
    parts = date_str.strip().split(".")
    if len(parts) == 3:
        try:
            return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        except (ValueError, IndexError):
            pass
    return None


# ---------------------------------------------------------------------------
# Main ingestion using DuckDB
# ---------------------------------------------------------------------------

def ingest_batch(con: duckdb.DuckDBPyConnection, parquet_url: str, census_only: bool) -> tuple[list[dict], int, int]:
    """Extract federal legislation from a single remote parquet file.

    Returns: (census_entries, laws_written, total_provisions)
    """
    # Query only federal legislation with all needed columns
    if census_only:
        query = f"""
            SELECT pravogovruNd, doc_typeIPS, headingIPS, docNumberIPS,
                   docdateIPS, statusIPS, issuedByIPS
            FROM read_parquet('{parquet_url}')
            WHERE {FEDERAL_FILTER}
        """
    else:
        query = f"""
            SELECT pravogovruNd, doc_typeIPS, headingIPS, docNumberIPS,
                   docdateIPS, statusIPS, issuedByIPS, textIPS
            FROM read_parquet('{parquet_url}')
            WHERE {FEDERAL_FILTER}
        """

    rows = con.execute(query).fetchall()

    census_entries = []
    laws_written = 0
    total_provisions = 0

    for row in rows:
        if census_only:
            nd, doc_type, heading, doc_number, date_str, status_ips, issued_by = row
            text = ""
        else:
            nd, doc_type, heading, doc_number, date_str, status_ips, issued_by, text = row

        nd = str(nd or "")
        doc_type = str(doc_type or "")
        heading = str(heading or "")
        doc_number = str(doc_number or "").strip()
        date_str = str(date_str or "").strip()
        status_ips = str(status_ips or "")
        issued_by = str(issued_by or "")
        text = str(text or "")

        # Skip NaN/None doc types that don't match by other criteria
        if doc_type in ("nan", "None", "") and "ФЗ" not in doc_number and "ФКЗ" not in doc_number:
            # Check if it matches by issuedByIPS
            if not any(issued_by.startswith(p) for p in ["Федеральный закон", "Федеральный конституционный закон"]):
                continue

        law_id = make_law_id(doc_number, date_str, heading, doc_type)
        law_type = map_law_type(doc_type, doc_number, issued_by, heading)
        status = map_status(status_ips)
        effective_date = parse_date(date_str)
        source_url = f"http://pravo.gov.ru/proxy/ips/?docbody=&nd={nd}" if nd else ""

        census_entries.append({
            "id": law_id,
            "nd": nd,
            "title": heading,
            "identifier": doc_number,
            "law_type": law_type,
            "status": status,
            "effective_date": effective_date or "",
            "classification": "ingestable" if text and len(text) > 50 else "metadata_only",
            "source_url": source_url,
        })

        if census_only:
            continue

        # Skip if seed file exists with real content
        seed_path = SEED_DIR / f"{law_id}.json"
        if seed_path.exists():
            try:
                existing = json.loads(seed_path.read_text(encoding="utf-8"))
                provs = existing.get("provisions", [])
                if provs and len(provs) > 0:
                    first = provs[0]
                    if first.get("article") != "0" or len(first.get("content", "")) > 200:
                        total_provisions += len(provs)
                        laws_written += 1
                        continue
            except (json.JSONDecodeError, KeyError):
                pass

        # Parse text into provisions
        cleaned = clean_text(text)
        if cleaned and len(cleaned) > 50:
            provisions = parse_articles(cleaned)
            if not provisions:
                provisions = [{
                    "article": "1",
                    "title": heading,
                    "content": cleaned,
                    "provision_ref": "1",
                    "order_index": 0,
                }]
        else:
            provisions = [{
                "article": "0",
                "title": heading,
                "content": f"{heading}\n\nФедеральное законодательство Российской Федерации.\nИсточник: {source_url}",
                "provision_ref": "0",
                "order_index": 0,
            }]

        seed_data = {
            "law": {
                "id": law_id,
                "title": heading,
                "identifier": doc_number,
                "law_type": law_type,
                "status": status,
                "effective_date": effective_date or "",
                "source_url": source_url,
                "last_updated": time.strftime("%Y-%m-%d"),
            },
            "provisions": provisions,
        }

        seed_path.write_text(json.dumps(seed_data, ensure_ascii=False, indent=2), encoding="utf-8")
        laws_written += 1
        total_provisions += len(provisions)

    return census_entries, laws_written, total_provisions


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Ingest Russian Law from RusLawOD via DuckDB")
    parser.add_argument("--census-only", action="store_true", help="Only generate census")
    parser.add_argument("--batch", type=int, help="Process only batch N (1-11)")
    args = parser.parse_args()

    print("=" * 70)
    print("Russian Law MCP — RusLawOD Full Ingestion (DuckDB Remote)")
    print("=" * 70)
    print()
    print("Strategy: DuckDB reads remote parquet files via HTTP range requests.")
    print("Only federal legislation rows and needed columns are transferred.")
    print()

    SEED_DIR.mkdir(parents=True, exist_ok=True)

    con = duckdb.connect()
    con.execute("SET http_timeout=120000")

    files = PARQUET_FILES
    if args.batch:
        files = [PARQUET_FILES[args.batch - 1]]

    all_census = []
    total_laws = 0
    total_provs = 0

    for i, url in enumerate(files):
        fname = url.split("/")[-1]
        print(f"\n[{i+1}/{len(files)}] {fname}")
        print("-" * 50)

        start_time = time.time()
        try:
            entries, written, provs = ingest_batch(con, url, census_only=args.census_only)
            elapsed = time.time() - start_time

            all_census.extend(entries)
            total_laws += written
            total_provs += provs

            print(f"  Federal legislation found: {len(entries)}")
            if not args.census_only:
                print(f"  Laws written: {written}, Provisions: {provs}")
            print(f"  Time: {elapsed:.1f}s")

        except Exception as e:
            elapsed = time.time() - start_time
            print(f"  ERROR ({elapsed:.1f}s): {e}")
            import traceback
            traceback.print_exc()

    con.close()

    # Deduplicate census by ID (keep first occurrence)
    seen_ids = {}
    deduped_census = []
    collisions = 0
    for entry in all_census:
        eid = entry["id"]
        if eid in seen_ids:
            # ID collision - check if it's a different document
            existing = seen_ids[eid]
            if existing["nd"] != entry["nd"]:
                collisions += 1
                # Create unique ID with nd suffix
                new_id = f"{eid}-{entry['nd'][-6:]}"
                entry["id"] = new_id
                # Rename seed file if needed
                old_path = SEED_DIR / f"{eid}.json"
                new_path = SEED_DIR / f"{new_id}.json"
                if old_path.exists() and not new_path.exists():
                    data = json.loads(old_path.read_text(encoding="utf-8"))
                    data["law"]["id"] = new_id
                    new_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
                seen_ids[new_id] = entry
                deduped_census.append(entry)
        else:
            seen_ids[eid] = entry
            deduped_census.append(entry)

    # Count stats
    type_counts = {}
    status_counts = {}
    class_counts = {}
    for e in deduped_census:
        lt = e.get("law_type", "unknown")
        type_counts[lt] = type_counts.get(lt, 0) + 1
        st = e.get("status", "unknown")
        status_counts[st] = status_counts.get(st, 0) + 1
        cl = e.get("classification", "unknown")
        class_counts[cl] = class_counts.get(cl, 0) + 1

    # Write census.json
    census_output = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": "RusLawOD (irlspbru/RusLawOD) via pravo.gov.ru",
        "description": "Full census of Russian Federation federal legislation",
        "stats": {
            "total": len(deduped_census),
            **{f"type_{k}": v for k, v in sorted(type_counts.items())},
            **{f"status_{k}": v for k, v in sorted(status_counts.items())},
            **{f"class_{k}": v for k, v in sorted(class_counts.items())},
            "id_collisions": collisions,
        },
        "laws": deduped_census,
    }

    if not args.census_only:
        census_output["ingestion"] = {
            "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "total_laws": total_laws,
            "total_provisions": total_provs,
            "coverage_pct": f"{(total_laws / max(len(deduped_census), 1)) * 100:.1f}",
        }

    CENSUS_PATH.write_text(json.dumps(census_output, ensure_ascii=False, indent=2), encoding="utf-8")

    # Count seed files
    seed_files = [f for f in SEED_DIR.glob("*.json") if not f.name.startswith("_")]

    # Summary
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"  Census entries: {len(deduped_census)}")
    if collisions:
        print(f"  ID collisions resolved: {collisions}")
    print(f"  By type:")
    for k, v in sorted(type_counts.items()):
        print(f"    {k}: {v}")
    print(f"  By status:")
    for k, v in sorted(status_counts.items()):
        print(f"    {k}: {v}")
    print(f"  By classification:")
    for k, v in sorted(class_counts.items()):
        print(f"    {k}: {v}")

    if not args.census_only:
        print(f"\n  Seed files: {len(list(seed_files))}")
        print(f"  Total provisions: {total_provs}")

    print(f"\n  Census: {CENSUS_PATH}")
    print(f"  Seeds:  {SEED_DIR}")

    ingestable = class_counts.get("ingestable", 0)
    if total_laws > 0 and total_laws >= ingestable:
        print("\n  100% of ingestable laws ingested!")
    elif total_laws > 0:
        print(f"\n  Coverage: {total_laws}/{ingestable} ({(total_laws/max(ingestable,1))*100:.1f}%)")

    print("\nNext steps:")
    print("  1. npm run build:db     # Build SQLite database")
    print("  2. npm test             # Run tests")
    print()


if __name__ == "__main__":
    main()
