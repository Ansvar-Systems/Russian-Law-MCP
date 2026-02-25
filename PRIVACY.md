# Privacy & Client Confidentiality

**CRITICAL READING FOR LEGAL PROFESSIONALS**

This document addresses privacy and confidentiality considerations when using this Tool, with particular attention to professional obligations under Russian law and the Federal Chamber of Advocates (Federalnaya Palata Advokatov).

---

## Executive Summary for Legal Professionals

**Key Risks:**
- Queries flow through Claude API infrastructure (Anthropic cloud)
- Query content may reveal client matters and privileged information
- Russian attorney-client privilege (advokatskaya tayna) requires strict data processing controls

**Safe Use Options:**
1. **General Legal Research**: Use Tool for non-client-specific queries
2. **On-Premise Deployment**: Self-host with local LLM for privileged matters (see below)
3. **Anonymization**: Remove all client-identifying information from queries

---

## Data Flows and Infrastructure

### MCP (Model Context Protocol) Architecture

This Tool uses the **Model Context Protocol (MCP)** to communicate with Claude:

```
User Query -> MCP Client (Claude Desktop/API) -> Anthropic Cloud -> MCP Server (This Tool) -> Database
```

**What This Means:**

1. **Queries Transit Anthropic Infrastructure**: Your queries are sent to Anthropic's servers for LLM processing
2. **Query Logging**: Anthropic may log queries subject to their [Privacy Policy](https://www.anthropic.com/legal/privacy)
3. **Tool Responses**: Database responses return through the same path
4. **No Direct Control**: You do not control Anthropic's data processing, retention, or security practices

### What Gets Transmitted

When you use this Tool through Claude Desktop or API:

- **Query Text**: The full text of your search queries
- **Tool Parameters**: Document IDs, provision references, filters, date ranges
- **Tool Responses**: Statute text, provision content
- **Metadata**: Timestamps, user agent, API keys (handled by Anthropic)

**What Does NOT Get Transmitted:**
- Direct database access (Tool runs locally, queries Anthropic only for LLM processing)
- Files on your computer
- Your full conversation history (unless using Claude.ai web interface)

### No Client Data Stored in MCP Server

This MCP server does **NOT** store any client data, user queries, or personal information. The database contains only publicly available federal legislation. Client context (company profiles, risk appetite, regulatory scope) is never persisted in the MCP server database.

---

## Legal Professional Obligations

### Advokatskaya Tayna (Attorney-Client Privilege)

Russian advocates are bound by **strict confidentiality rules** under Federal Law No. 63-FZ "On Advocates' Activity and the Bar in the Russian Federation" (Ob advokatskoy deyatelnosti i advokature v RF).

#### Scope of Privilege

**Applies to:**
- All client communications
- Client identity (in sensitive matters)
- Case strategy and legal analysis
- Information that could identify client or matter
- Any information obtained in connection with legal assistance

**Consequences of Breach:**
- Professional disciplinary action by the bar association
- Suspension or disbarment
- Civil liability to client
- Criminal liability under Article 310 of the Criminal Code (disclosure of investigation data)

### Federal Law No. 152-FZ on Personal Data

Under **Federal Law No. 152-FZ "On Personal Data"** (O personalnykh dannykh), when you use a service that processes personal data:

- You may be considered a **Data Operator** (operator personalnykh dannykh)
- Data processing requires a **legal basis** (consent, contract, or legitimate interest)
- Cross-border data transfer restrictions apply (Articles 12, 18)
- Personal data of Russian citizens must be stored on servers located in Russia (data localization requirement)

**Do You Have a Data Processing Agreement with Anthropic?**
- Check [Anthropic's Commercial Terms](https://www.anthropic.com/legal/commercial-terms) for DPA coverage
- Confirm whether Anthropic's terms meet your obligations under 152-FZ
- Consider data localization requirements for personal data of Russian citizens

---

## Risk Assessment by Use Case

### LOW RISK: General Legal Research

**Safe to use through Claude API:**

```
Example Query: "What does Federal Law 152-FZ say about personal data breach notification?"
```

- No client identity
- No case-specific facts
- No privileged strategy
- Publicly available legal information

### MEDIUM RISK: Anonymized Client Matters

**Use with caution:**

```
Example Query: "What are the penalties under the Criminal Code for economic crimes?"
```

**Risks:**
- Query pattern may reveal you're working on a specific type of matter
- If combined with other contextual clues, may identify client
- Anthropic logs may link query to your API key

**Mitigation:**
- Remove ALL identifying details
- Use general terms, not case-specific facts
- Consider whether even legal area is sensitive

### HIGH RISK: Client-Specific Queries

**DO NOT USE through Claude API:**

```
Bad Example: "Find provisions about liability for data breaches by telecom operators in Moscow"
```

**Why This is Dangerous:**
- Geographic specificity
- Industry-specific context
- May reveal client identity or confidential strategy
- May violate advokatskaya tayna even if client name not mentioned

**What to do instead:**
- Use ConsultantPlus, Garant, or other commercial legal databases with DPAs
- Use on-premise deployment (see below)
- Conduct manual research through official channels

---

## On-Premise Deployment

For **privileged legal matters**, deploy this Tool with a **self-hosted LLM** to eliminate external data transmission.

### Architecture

```
User Query -> Local MCP Client -> Local LLM (no external API) -> MCP Server (This Tool) -> Local Database
```

**Benefits:**
- No query data sent to Anthropic or any external service
- Full control over logging and data retention
- Compliant with advokatskaya tayna requirements
- Compliant with 152-FZ data localization requirements
- No cross-border data transfer concerns

### Self-Hosted LLM Options

| Solution | Complexity | Model Quality | Cost |
|----------|------------|---------------|------|
| **Ollama** (local) | Low | Medium (Llama 3.1) | Free (hardware only) |
| **LM Studio** (local) | Low | Medium-High | Free (hardware only) |
| **OpenLLM** (local/cloud) | Medium | High (custom models) | Variable |
| **vLLM** (self-hosted cloud) | High | High (latest models) | Server costs |

### Hardware Requirements

For acceptable performance with a 70B parameter model (Llama 3.1 70B or similar):

- **GPU**: NVIDIA A100 (80GB) or H100 (recommended)
- **RAM**: 128GB+ system RAM
- **Storage**: 200GB+ SSD for models and database
- **Fallback**: Use smaller models (7B-13B) on consumer GPU (RTX 4090)

### Setup Guide

1. **Install Ollama** (easiest option):
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.ai/install.sh | sh

   # Pull a model
   ollama pull llama3.1:70b
   ```

2. **Configure MCP to use Ollama**:
   ```json
   {
     "mcpServers": {
       "russian-law": {
         "command": "npx",
         "args": ["-y", "@ansvar/russian-law-mcp"],
         "env": {
           "ANTHROPIC_API_KEY": "local",
           "LOCAL_LLM": "ollama",
           "LOCAL_LLM_MODEL": "llama3.1:70b"
         }
       }
     }
   }
   ```

3. **Deploy Database Locally**:
   - Database is already local (SQLite file)
   - Ensure `data/database.db` is on encrypted disk
   - Run updates locally

### Cloud Deployment (Private Infrastructure)

For law firms requiring cloud scalability with confidentiality:

1. **Deploy to Private VPC** (Yandex Cloud, VK Cloud, or on-premise data center)
2. **Use Private Network** for all services
3. **Self-hosted LLM** on VM (no external LLM APIs)
4. **Encrypted Database** with KMS-managed keys
5. **Network Isolation** -- no internet access, internal-only endpoints
6. **Audit Logging** -- full audit trail for compliance
7. **Data Localization** -- ensure all data remains within Russian Federation territory

**Estimated Cost**: 50,000-200,000 RUB/month depending on usage and instance sizes

---

## Query Logging and Data Retention

### Anthropic's Data Practices

Per [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy):

- **API Queries**: May be logged for abuse prevention and model improvement
- **Retention Period**: Check current policy (subject to change)
- **Opt-Out**: Commercial/Enterprise plans may have different retention terms
- **Zero Data Retention (ZDR)**: Available for some Enterprise customers

**ACTION REQUIRED**: Review Anthropic's current policy and negotiate ZDR if needed for professional use.

### This Tool's Data Practices

**Local Data (Not Transmitted):**
- **Database**: Stored locally, never transmitted
- **Query History**: NOT logged by this Tool
- **User Data**: No personal data collected or stored

**Transmitted Data (via Anthropic):**
- Query text and tool parameters (logged per Anthropic policy)
- Tool responses (logged per Anthropic policy)

---

## Recommendations by User Type

### Solo Practitioners / Small Firms

1. **General Research**: Use Claude API for non-client-specific research
2. **Client Matters**: Use ConsultantPlus/Garant or manual research
3. **Budget Option**: Deploy locally with Ollama for confidential queries
4. **Document Queries**: Keep query log to assess confidentiality risks monthly

### Large Firms / Corporate Legal Departments

1. **Enterprise DPA**: Negotiate Data Processing Agreement with Anthropic
2. **Zero Data Retention**: Require ZDR or minimal retention in DPA
3. **On-Premise Deployment**: Deploy privately hosted LLM infrastructure
4. **Information Security Audit**: Conduct privacy impact assessment
5. **Staff Training**: Train lawyers on safe vs. unsafe queries

### Government / Public Sector

1. **Security Classification**: Treat all government legal work as confidential
2. **On-Premise Required**: Use self-hosted deployment, no external APIs
3. **Data Localization**: Ensure compliance with 152-FZ data localization requirements
4. **Air-Gapped Option**: Fully isolated network for sensitive matters
5. **Procurement Compliance**: Follow public procurement rules (44-FZ) for infrastructure

---

## Compliance Checklist

### Before Using for Professional Legal Work

- [ ] Read and understood [DISCLAIMER.md](DISCLAIMER.md)
- [ ] Reviewed Anthropic Privacy Policy and Terms
- [ ] Determined whether Data Processing Agreement is required
- [ ] Assessed whether client consent is needed
- [ ] Decided on deployment model (Cloud API vs. On-Premise)
- [ ] Trained staff on confidential vs. non-confidential queries
- [ ] Updated engagement letters to disclose AI tool use (if required)
- [ ] Established query anonymization procedures
- [ ] Documented decision to use Tool in risk management records
- [ ] Verified compliance with 152-FZ data localization requirements

---

## Questions and Support

### Privacy Questions

For questions about privacy and confidentiality:

1. **Anthropic Privacy**: Contact privacy@anthropic.com
2. **Bar Association Guidance**: Consult the Federal Chamber of Advocates ethics guidance
3. **Tool-Specific**: Open issue on [GitHub](https://github.com/Ansvar-Systems/Russian-Law-MCP/issues)

### Incident Reporting

If you suspect a confidentiality breach (e.g., accidentally queried client name):

1. **Document Incident**: Record what information was transmitted and when
2. **Notify Client**: Inform affected client as appropriate
3. **Contact Anthropic**: Request deletion of query logs (if possible)
4. **Bar Association**: Report to relevant bar association if required
5. **Roskomnadzor**: Report to Roskomnadzor if personal data breach under 152-FZ

---

## Changes to This Policy

This privacy notice may be updated as:
- Anthropic changes their data practices
- New professional ethics guidance emerges
- Tool deployment options expand
- Russian data protection law evolves

Check [GitHub repository](https://github.com/Ansvar-Systems/Russian-Law-MCP) for current version.

---

**Last Updated**: 2026-02-25
**Tool Version**: 0.1.0

---

## Summary: Safe Use Guidelines

- **DO**: Use for general, non-client-specific legal research
- **DO**: Deploy on-premise for privileged client matters
- **DO**: Anonymize queries and remove all client identifiers
- **DO**: Obtain client consent if required by professional rules
- **DO**: Document AI tool use and confidentiality assessments

- **DON'T**: Include client names, case numbers, or identifying facts in queries
- **DON'T**: Use for sensitive matters without on-premise deployment
- **DON'T**: Assume Anthropic's standard terms meet your 152-FZ obligations
- **DON'T**: Use personal Claude.ai account for professional legal work
- **DON'T**: Forget that query patterns may reveal confidential information even without explicit identifiers
