# Coverage: Russian Federal Legislation

**12,393 laws | 79,178 provisions | Full-text searchable (FTS5)**

Last updated: 2026-02-25

## Coverage Status

- **100% of ingestable federal legislation ingested** (12,359 of 12,369 census entries)
- **Laws with full article-level text:** 12,383 laws with parsed provisions
- **Laws with metadata only:** 10 (text not available in source dataset)
- **Total provisions:** 79,178

Data source: [RusLawOD](https://huggingface.co/datasets/irlspbru/RusLawOD) — 304,382 Russian legal documents from pravo.gov.ru, filtered for federal legislation. Article-level provisions parsed from full law text.

---

## Corpus Breakdown

| Category | Documents | Status |
|----------|-----------|--------|
| Federal Laws (Федеральные законы) | 12,132 | Full text |
| Federal Constitutional Laws (ФКЗ) | 193 | Full text |
| Codes (Кодексы) | 43 | Full text |
| Constitution | 1 | Full text |
| **Total** | **12,369** | |

## By Status

| Status | Count |
|--------|-------|
| In force (Действует без изменений) | 9,122 |
| Amended (Действует с изменениями) | 2,382 |
| Repealed (Утратил силу) | 865 |

---

## Key Domain Coverage

| Domain | Key Laws |
|--------|----------|
| **Data Protection** | 152-ФЗ (Personal Data), 149-ФЗ (Information), 242-ФЗ (Data Localization) |
| **Cybersecurity** | 187-ФЗ (Critical Infrastructure), 63-ФЗ (Electronic Signatures), 126-ФЗ (Communications) |
| **Criminal** | УК РФ (Criminal Code), УПК РФ (Criminal Procedure), КоАП РФ (Administrative Offences) |
| **Civil/Commercial** | ГК РФ Parts 1-4, 14-ФЗ (LLCs), 208-ФЗ (JSCs), 127-ФЗ (Bankruptcy) |
| **Labor** | ТК РФ (Labor Code), 79-ФЗ (Civil Service) |
| **Tax** | НК РФ Parts 1-2 (Tax Code) |
| **Constitutional** | Constitution, ФКЗ (Constitutional/Supreme Courts) |
| **Anti-Corruption** | 273-ФЗ (Anti-Corruption), 115-ФЗ (AML), 255-ФЗ (Foreign Agents) |
| **Competition** | 135-ФЗ (Competition), 147-ФЗ (Natural Monopolies) |
| **Healthcare** | 323-ФЗ (Healthcare), 52-ФЗ (Sanitary-Epidemiological) |
| **Environment** | 7-ФЗ (Environment), ВК РФ (Water Code), ЛК РФ (Forest Code) |
| **Education** | 273-ФЗ (Education) |
| **Transport** | КТМ РФ (Merchant Shipping), ВзК РФ (Air Code) |
| **AI/Digital** | 258-ФЗ (Digital Sandboxes), 123-ФЗ (AI Regulatory Sandbox) |

---

## Notes

- All text is in Russian (original language of legislation)
- Primary data source: pravo.gov.ru via RusLawOD academic dataset
- RusLawOD provides original signed texts (not consolidated amended versions)
- Article-level provision parsing handles Статья N. patterns, chapters, sections
- Database uses SQLite FTS5 with unicode61 tokenizer for Cyrillic full-text search
