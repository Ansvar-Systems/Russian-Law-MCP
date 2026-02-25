# Data Sources and Authority

This document details the provenance, authority level, and reliability of legal data in this Tool.

---

## Source Hierarchy

### 1. Official Government Source (Highest Authority)

#### pravo.gov.ru -- Official Internet Portal for Legal Information

**URL**: http://pravo.gov.ru/

**Authority Level**: Official / Authoritative

**What It Is:**
- Official Internet Portal for Legal Information (Ofitsialnyi internet-portal pravovoi informatsii)
- Operated by the Administration of the President of the Russian Federation
- Primary source for the official publication of federal laws, presidential decrees, and government resolutions
- Established by Presidential Decree No. 763 of 23 May 1996

**Used For:**
- Federal law full text (statute content)
- Federal constitutional law text
- Code text (kodeksy)
- Constitutional text
- Document metadata (dates, identifiers, status)

**Reliability:**
- **High**: Official government publication
- **Currency**: Updated when laws are officially published
- **Completeness**: Comprehensive coverage of all federal legislation
- **Accuracy**: Authoritative legal text (official publication)

**Limitations:**
- **Lag Time**: Data in this Tool may lag official publications due to periodic ingestion
- **Amendments**: Consolidated text may lag amendments (not always real-time in this Tool)
- **No Annotations**: Plain statutory text without commentary or cross-references
- **HTML Format**: Some older texts may have OCR artifacts from PDF-to-HTML conversion

**Copyright Status:**
Per **Article 1259, Paragraph 6 of the Civil Code of the Russian Federation**, official documents of state bodies (including laws, court decisions, and other legislative, administrative, and judicial texts) are **not subject to copyright**. Federal legislation is therefore in the public domain.

---

### 2. Commercial Legal Databases (Professional Standard)

This Tool does **NOT** include commercial database content, but professional users should cross-check with these authoritative sources:

#### ConsultantPlus

**URL**: https://www.consultant.ru/

**Authority Level**: Editorially Verified / Professional Standard

**What It Is:**
- Leading Russian legal database
- Editorially verified statute text with commentary
- Comprehensive court practice, commentary, and cross-references
- Real-time updates and currency guarantees

**Why It's Better:**
- **Editorial Oversight**: Legal experts verify all content
- **Annotations**: Commentary explains application and interpretation
- **Cross-References**: Linked to court practice, commentary, and doctrine
- **Historical Versions**: Date-specific lookup of provision wording
- **Regional Coverage**: Includes regional legislation

#### Garant

**URL**: https://www.garant.ru/

**Authority Level**: Editorially Verified / Professional Standard

**What It Is:**
- Major Russian legal information system
- Competing with ConsultantPlus for professional market
- Similar features: annotations, commentary, editorial oversight

#### Kodeks

**URL**: https://kodeks.ru/

**Authority Level**: Editorially Verified / Professional Standard

**What It Is:**
- Legal information system with normative-technical documentation focus

---

## Data Quality Comparison

| Source | Authority | Currency | Annotations | Cost | Professional Use |
|--------|-----------|----------|-------------|------|------------------|
| **pravo.gov.ru** | Official | High | None | Free | Statute text verification |
| **ConsultantPlus** | Professional | Very High | Expert | Subscription | Primary professional source |
| **Garant** | Professional | Very High | Expert | Subscription | Primary professional source |
| **This Tool** | Derived from official | Medium | None | Free | Initial research -- verify |

---

## How This Tool Uses Sources

### Statute Data Pipeline

```
RusLawOD (Hugging Face) -> DuckDB Remote Query -> Article Parser -> Seed JSON -> SQLite + FTS5
pravo.gov.ru (fallback)  -> HTTP Fetch -> HTML Parse -> Seed JSON -> SQLite + FTS5
```

**Primary pipeline** (RusLawOD / DuckDB):
1. **Query**: DuckDB reads remote parquet files via HTTP range requests
2. **Filter**: Only federal legislation extracted (~12K of 304K documents)
3. **Parse**: Article-level provisions extracted from full text
4. **Storage**: Seed JSON files → SQLite with FTS5 indexing

**Fallback pipeline** (pravo.gov.ru direct):
1. **Fetch**: HTTP requests to pravo.gov.ru/proxy/ips/
2. **Parse**: HTML → articles via Cheerio + regex
3. **Storage**: Same seed JSON → SQLite pipeline

**Run ingestion**:
```bash
npm run ingest:ruslawod   # Primary (RusLawOD via DuckDB)
npm run ingest            # Fallback (pravo.gov.ru direct)
npm run build:db          # Rebuild database from seed files
```

**Frequency**: Periodic (manual or scheduled) -- NOT automatic real-time sync

**Lag Time**: RusLawOD dataset covers through 2023. Newer laws require direct pravo.gov.ru ingestion.

---

## Data Freshness Strategy

### Current Mechanism: Periodic Updates

**Problem**: Data goes stale after ingestion
**Impact**: Professional users may rely on outdated law

**How to Update:**

```bash
# Check for amendments
npm run freshness:check

# Re-ingest updated laws
npm run ingest

# Rebuild database
npm run build
```

**Recommended Frequency:**
- **Statutes**: Monthly check via freshness monitoring
- **Emergency**: Immediately before critical legal work

---

## Attribution Requirements

### pravo.gov.ru Data (Government Open Data)

Per Article 1259(6) of the Civil Code, federal legislation is not copyrightable. No specific attribution is legally required, but recommended:

> Statute text sourced from the Official Internet Portal for Legal Information (http://pravo.gov.ru/)

---

## Verification Workflow for Professional Use

### Recommended Process

1. **Initial Research**: Use this Tool for preliminary searches

2. **Official Verification**:
   ```
   Statute Text:   pravo.gov.ru
   ```

3. **Professional Database Cross-Check**:
   ```
   Use ConsultantPlus/Garant for:
   - Editorial annotations
   - Cross-references to court practice
   - Commentary on application
   - Currency guarantees
   - Historical versions
   ```

4. **Document Sources**:
   - Cite official sources in legal work (not this Tool)
   - Keep audit trail of verification steps

---

## Source Authority Matrix

### When to Trust Each Source

| Legal Task | This Tool | pravo.gov.ru | ConsultantPlus/Garant |
|------------|-----------|--------------|----------------------|
| **Quick lookup** | Fast | Official | Professional |
| **Preliminary research** | Good starting point | Authoritative | Comprehensive |
| **Cite in court filing** | Verify first | Acceptable | Professional standard |
| **Client advice** | Verify first | Verify currency | Safe |
| **Complex interpretation** | No annotations | No commentary | Expert commentary |
| **Historical research** | Not available | Limited | Historical versions |

---

## Transparency Commitments

### What We Disclose

1. **Source Provenance**: Every result indicates data source
2. **Currency Metadata**: Last-updated timestamps in responses
3. **Staleness Warnings**: Alerts when data may be outdated
4. **Coverage Gaps**: Explicit notice of missing sources
5. **Authority Levels**: Clear distinction between official and derived data

### What We Don't Track

- Individual user queries (not logged by this Tool)
- Query frequency or patterns
- User identity or organization
- Client matter details

**Privacy Note**: See [PRIVACY.md](PRIVACY.md) for full data handling details.

---

## Summary: Source Trust Levels

**For Professional Legal Work:**

| Source | Use Case | Trust Level |
|--------|----------|-------------|
| **pravo.gov.ru (direct)** | Statute text | Fully trustworthy |
| **ConsultantPlus/Garant** | All legal research | Professional standard |
| **This Tool** | Initial research | Starting point -- verify |

**Golden Rule**: Always verify with official or professional-grade sources before relying on data in legal work.

---

**Last Updated**: 2026-02-25
**Tool Version**: 0.1.0
