# MCP Server Discovery Sources

## Overview

This document lists all sources for discovering MCP servers to populate mcplist.site.

**Current**: 35 servers
**Target**: 500+ servers

---

## Primary Sources (HIGH Priority)

### 1. Official MCP Registry
- **URL**: https://registry.modelcontextprotocol.io
- **Type**: Official registry
- **Status**: API v0.1 (frozen, stable)
- **Maintained by**: MCP Steering Group

### 2. GitHub Awesome Lists

| Repository | Est. Servers | Notes |
|------------|--------------|-------|
| punkpeye/awesome-mcp-servers | 500+ | Production-ready & experimental |
| wong2/awesome-mcp-servers | 300+ | Well-curated with descriptions |
| appcypher/awesome-mcp-servers | 200+ | Production-ready focus |
| TensorBlock/awesome-mcp-servers | 300+ | Comprehensive collection |
| habitoai/awesome-mcp-servers | 200+ | Good categorization |
| jaw9c/awesome-remote-mcp-servers | 50+ | Remote-only servers |
| rohitg00/awesome-devops-mcp-servers | 100+ | DevOps-focused |

**GitHub Topic**: https://github.com/topics/awesome-mcp-servers

### 3. npm Registry
- **Scope**: `@modelcontextprotocol/*`
- **Search**: `mcp server` keyword
- **API**: https://registry.npmjs.org/-/v1/search

### 4. Anthropic Reference Servers
- **URL**: https://github.com/modelcontextprotocol/servers
- **Type**: Official implementations
- **Servers**: Google Drive, Slack, GitHub, Git, Postgres, Puppeteer, Stripe

---

## Secondary Sources (MEDIUM Priority)

### 5. Third-Party Directories

| Site | Est. Servers | Notes |
|------|--------------|-------|
| mcp.so | 17,210+ | Largest community-driven |
| PulseMCP | 6,960+ | Daily updated |
| mcpservers.org | Curated | Well-organized |
| AI Agents List | 593+ | Good taxonomy |
| Portkey | 138+ | 1-click try feature |
| MCP Server Finder | 500+ | Detailed info |

### 6. Community Communication

| Platform | Where to Look |
|----------|---------------|
| GitHub | Discussions on MCP repos |
| Discord | MCP community servers |
| Reddit | r/SaaS, r/startups, r/OpenAI |
| Hacker News | "Show HN" posts |
| Twitter/X | #MCP hashtag |

---

## Data Collection Strategy

### Phase 1: Awesome Lists (Playwright)
```bash
# Scrape README.md from each repo
# Parse markdown tables and lists
# Extract: name, description, github_url, author
```

### Phase 2: GitHub API
```bash
# For each github_url, fetch:
GET /repos/{owner}/{repo}
# Extract: stars, forks, issues, language, license, pushed_at
```

### Phase 3: npm API
```bash
# For packages with npm presence:
GET https://api.npmjs.org/downloads/point/last-week/{package}
```

### Phase 4: Deduplication
```python
# Deduplicate by github_url (primary key)
# Merge data from multiple sources
# Resolve conflicts (prefer more detailed)
```

---

## Data Schema

Each server entry should have:

```json
{
  "id": "unique-slug",
  "name": "Server Name",
  "description": "What it does",
  "category": "one of 12 categories",
  "author": "Author Name",
  "authorUrl": "https://author.site",
  "githubUrl": "https://github.com/...",
  "npmPackage": "@scope/package",
  "installCommand": "npx -y @scope/package",
  "isOfficial": false,
  "tags": ["tag1", "tag2"],
  "bestFor": ["use case 1", "use case 2"],

  // Metrics (fetched)
  "stars": 1234,
  "forks": 56,
  "openIssues": 12,
  "lastUpdated": "2025-12-20",
  "language": "TypeScript",
  "license": "MIT",
  "weeklyDownloads": 5000,

  // Calculated
  "score": 78,
  "rating": 4
}
```

---

## Categories

1. filesystem
2. database
3. browser-automation
4. cloud-platforms
5. version-control
6. communication
7. search
8. ai-tools
9. code-execution
10. media
11. productivity
12. utilities

---

## Rate Limits

| API | Unauthenticated | Authenticated |
|-----|-----------------|---------------|
| GitHub | 60/hr | 5,000/hr |
| npm | 10,000/day | 10,000/day |

**Recommendation**: Use GitHub token for data collection

---

## Scraping Schedule

| Task | Frequency |
|------|-----------|
| Full awesome list scrape | Weekly |
| GitHub metrics update | Daily (top 100) |
| npm downloads update | Daily |
| New server discovery | Weekly |

---

## Last Updated: 2025-12-21
