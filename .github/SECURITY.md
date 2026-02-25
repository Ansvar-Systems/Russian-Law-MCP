# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do NOT open a public GitHub issue**
2. Email: hello@ansvar.ai
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

We will respond within 48 hours and provide a timeline for a fix.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Security Scanning

This repository uses automated security scanning:

- **CodeQL** -- Static analysis (weekly + PRs)
- **Semgrep** -- SAST scanning (every push)
- **Trivy** -- Dependency and container scanning (daily)
- **Gitleaks** -- Secret detection (every push)
- **Socket.dev** -- Supply chain attack detection (PRs)
- **OSSF Scorecard** -- OpenSSF best practices (weekly)
- **Docker Security** -- Container image scanning (weekly)

## Security Best Practices

- All database queries use prepared statements (no SQL injection)
- Read-only database access at runtime
- Input validation on all user parameters
- No execution of user-provided code
- Dependencies tracked via package-lock.json

## Contact

For security inquiries: hello@ansvar.ai
