# Russian Law MCP Server

**Russian federal legislation, AI-readable.**

[![npm version](https://badge.fury.io/js/@ansvar%2Frussian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/russian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/Russian-Law-MCP?style=social)](https://github.com/Ansvar-Systems/Russian-Law-MCP)
[![CI](https://github.com/Ansvar-Systems/Russian-Law-MCP/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Russian-Law-MCP/actions/workflows/ci.yml)
[![Daily Data Check](https://github.com/Ansvar-Systems/Russian-Law-MCP/actions/workflows/check-updates.yml/badge.svg)](https://github.com/Ansvar-Systems/Russian-Law-MCP/actions/workflows/check-updates.yml)

Query **108 Russian federal laws** -- from the Civil Code and Criminal Code to the Personal Data Law and Communications Law -- directly from Claude, Cursor, or any MCP-compatible client.

If you're building legal tech, compliance tools, or doing Russian legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Russian legal research requires navigating pravo.gov.ru, ConsultantPlus, and multiple government portals. Whether you're:
- A **lawyer** validating citations in a contract or brief
- A **compliance officer** checking if a federal law is still in force
- A **legal tech developer** building tools on Russian law
- A **researcher** analyzing Russian regulatory frameworks

...you shouldn't need to manually navigate government portals and PDF documents. Ask Claude. Get the exact provision. With context.

This MCP server makes Russian federal law **searchable, cross-referenceable, and AI-readable**.

---

## Quick Start

### Use Remotely (No Install Needed)

> Connect directly to the hosted version -- zero dependencies, nothing to install.

**Endpoint:** `https://russian-law-mcp.vercel.app/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude.ai** | Settings > Connectors > Add Integration > paste URL |
| **Claude Code** | `claude mcp add russian-law --transport http https://russian-law-mcp.vercel.app/mcp` |
| **Claude Desktop** | Add to config (see below) |
| **GitHub Copilot** | Add to VS Code settings (see below) |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "russian-law": {
      "type": "url",
      "url": "https://russian-law-mcp.vercel.app/mcp"
    }
  }
}
```

**GitHub Copilot** -- add to VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "russian-law": {
      "type": "http",
      "url": "https://russian-law-mcp.vercel.app/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/russian-law-mcp
```

**Claude Desktop** -- add to `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "russian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/russian-law-mcp"]
    }
  }
}
```

**Cursor / VS Code:**

```json
{
  "mcp.servers": {
    "russian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/russian-law-mcp"]
    }
  }
}
```

## Example Queries

Once connected, just ask naturally:

- *"What does Federal Law 152-FZ say about personal data processing consent?"*
- *"Is Article 1259 of the Civil Code still in force?"*
- *"Find provisions about kriticheskaya informatsionnaya infrastruktura in Russian law"*
- *"What are the penalties for data breaches under KoAP RF?"*
- *"Search for provisions about electronic signatures in Russian legislation"*
- *"Validate the citation: Federalnyy zakon ot 27.07.2006 No. 152-FZ"*

---

## What's Included

| Category | Count | Details |
|----------|-------|---------|
| **Laws** | 108 documents | Constitution, codes, federal laws |
| **Provisions** | 5,364 sections | Full-text searchable with FTS5 |
| **Database Size** | ~15 MB | Optimized SQLite, portable |

**Verified data only** -- every provision is validated against official sources (pravo.gov.ru). Zero LLM-generated content.

---

## Available Tools (13)

### Core Legal Research Tools (6)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 search on 5,364 provisions with BM25 ranking |
| `get_provision` | Retrieve specific provision by document ID + article/section |
| `validate_citation` | Validate citation against database (zero-hallucination check) |
| `build_legal_stance` | Aggregate citations from statutes for a legal question |
| `format_citation` | Format citations per Russian conventions (full/short/pinpoint) |
| `check_currency` | Check if statute is in force, amended, or repealed |

### EU/International Law Integration Tools (5)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get EU/international legal basis for Russian statute |
| `get_russian_implementations` | Find Russian laws implementing EU instrument |
| `search_eu_implementations` | Search EU documents with Russian implementation info |
| `get_provision_eu_basis` | Get EU law references for specific provision |
| `validate_eu_compliance` | Check implementation status |

### Metadata Tools (2)

| Tool | Description |
|------|-------------|
| `list_sources` | Data provenance metadata and coverage information |
| `about` | Server metadata, dataset statistics, and freshness |

---

## Data Sources & Freshness

All content is sourced from the authoritative Russian legal database:

- **[pravo.gov.ru](http://pravo.gov.ru/)** -- Official Internet Portal for Legal Information (Administration of the President of the Russian Federation)

### Copyright Status

Per **Article 1259, Paragraph 6 of the Civil Code of the Russian Federation**, federal laws, codes, presidential decrees, and other official documents are **not copyrightable**. All legislative text in this database is in the public domain.

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |
| **Docker Security** | Container image scanning + SBOM generation | Weekly |
| **Socket.dev** | Supply chain attack detection | PRs |
| **OSSF Scorecard** | OpenSSF best practices scoring | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from official pravo.gov.ru publications. However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Verify critical citations** against primary sources
> - **Regional legislation and court practice are not included**
> - For professional use, cross-check with ConsultantPlus or Garant

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [PRIVACY.md](PRIVACY.md)

### Client Confidentiality

Queries go through the Claude API. For privileged or confidential matters, use on-premise deployment. See [PRIVACY.md](PRIVACY.md) for attorney-client privilege (advokatskaya tayna) guidance.

---

## Documentation

- **[Coverage](COVERAGE.md)** -- Full list of 108 ingested laws
- **[Coverage Limitations](COVERAGE_LIMITATIONS.md)** -- What's missing and workarounds
- **[Data Sources](DATA_SOURCES.md)** -- Source provenance and authority levels
- **[Security Policy](SECURITY.md)** -- Vulnerability reporting and scanning details
- **[Disclaimer](DISCLAIMER.md)** -- Legal disclaimers and professional use notices
- **[Privacy](PRIVACY.md)** -- Client confidentiality and data handling
- **[EU AI Act Compliance](EU_AI_ACT_COMPLIANCE.md)** -- AI Act classification and compliance

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/Russian-Law-MCP
cd Russian-Law-MCP
npm install
npm run build
npm test
```

### Running Locally

```bash
npm run dev                                       # Start MCP server
npx @anthropic/mcp-inspector node dist/index.js   # Test with MCP Inspector
```

### Performance

- **Search Speed:** <100ms for most FTS5 queries
- **Database Size:** ~15 MB (efficient, portable)

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, and more. `npx @ansvar/eu-regulations-mcp`

### @ansvar/russian-law-mcp (This Project)
**Query 108 Russian federal laws directly from Claude** -- Civil Code, Criminal Code, Personal Data Law, and more. `npx @ansvar/russian-law-mcp`

### [@ansvar/us-regulations-mcp](https://github.com/Ansvar-Systems/US_Compliance_MCP)
**Query US federal and state compliance laws** -- HIPAA, CCPA, SOX, and more. `npx @ansvar/us-regulations-mcp`

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- Full article-level parsing for stub-entry laws
- Regional legislation integration
- Court practice integration
- Historical statute versions

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{russian_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Russian Law MCP Server: Federal Legislation Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/Russian-Law-MCP},
  note = {108 Russian federal laws with 5,364 provisions and full-text search}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Federal Legislation:** Not copyrightable per Article 1259 Civil Code (public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools. This MCP server makes Russian federal legislation searchable and AI-readable -- because navigating pravo.gov.ru shouldn't require hours of manual effort.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>
