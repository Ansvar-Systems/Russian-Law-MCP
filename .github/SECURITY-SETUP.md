# Security Setup Guide

This document describes how to configure the security scanning workflows for this repository.

## Prerequisites

### GitHub Repository Settings

1. **Enable GitHub Advanced Security** (free for public repos)
   - Settings > Code security and analysis > Enable all

2. **Enable Dependabot**
   - Settings > Code security and analysis > Dependabot alerts: Enable
   - Dependabot security updates: Enable

### Required Secrets

| Secret | Required By | How to Get |
|--------|-------------|------------|
| `NPM_TOKEN` | publish.yml | npm.com > Access Tokens > Generate |
| `AZURE_CREDENTIALS` | publish.yml | Azure CLI: `az ad sp create-for-rbac` |

### Optional Services

| Service | Workflow | Setup |
|---------|----------|-------|
| **Socket.dev** | socket-security.yml | Sign up at https://socket.dev (free for OSS) |

## Workflow Overview

### On Every Push
- **Semgrep** -- SAST scanning
- **Trivy** -- Vulnerability scanning
- **Gitleaks** -- Secret detection

### On Pull Requests
- All of the above, plus:
- **CodeQL** -- Static analysis
- **Socket.dev** -- Supply chain security

### Scheduled
- **CodeQL** -- Weekly (Monday 6 AM UTC)
- **OSSF Scorecard** -- Weekly (Monday 2 AM UTC)
- **Trivy** -- Daily (3 AM UTC)
- **Docker Security** -- Weekly (Wednesday 3 AM UTC)
- **Drift Detection** -- Weekly (Thursday 3 AM UTC)
- **Data Freshness** -- Weekly (Friday 5 AM UTC)

### On Version Tags
- **Publish** -- npm + MCP Registry
- **MCPB Bundle** -- MCP bundle generation

## Verifying Setup

After enabling all workflows:

1. Push a commit to trigger on-push workflows
2. Check Actions tab for workflow results
3. Check Security tab for SARIF uploads
4. Verify Dependabot alerts are active

## Troubleshooting

### CodeQL Not Running
- Ensure GitHub Advanced Security is enabled
- Check that the repository is not archived

### Trivy SARIF Upload Fails
- Ensure `security-events: write` permission is set
- Check that GitHub Advanced Security is enabled

### Socket.dev Skipped
- The action runs with `continue-on-error: true`
- Sign up at socket.dev for full functionality
