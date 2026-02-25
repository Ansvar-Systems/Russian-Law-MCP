# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-25

### Added

- Initial release with 108 federal laws and 5,364 provisions
- 13 MCP tools for legal research (search, retrieve, validate, format, cross-reference)
- Full-text search with FTS5 and BM25 ranking
- EU/international law cross-reference support
- Citation validation and formatting for Russian legal conventions
- Currency checking (in force / amended / repealed)
- Dual transport: stdio (npm) and Streamable HTTP (Vercel)
- Golden contract tests with hash-anchored fixtures
- Freshness monitoring scripts
- Comprehensive open-source documentation (DISCLAIMER, PRIVACY, SECURITY, COVERAGE)
- 6-layer CI/CD security pipeline (CodeQL, Semgrep, Trivy, Gitleaks, Socket, OSSF)
- Docker multi-stage build
- MCP Registry metadata (server.json)

### Data Sources

- pravo.gov.ru (Official Internet Portal for Legal Information)
- Article 1259 Civil Code: federal laws not copyrightable

[0.1.0]: https://github.com/Ansvar-Systems/Russian-Law-MCP/releases/tag/v0.1.0
