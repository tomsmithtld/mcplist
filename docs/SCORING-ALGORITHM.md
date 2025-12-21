# MCP Server Scoring Algorithm

## Overview

A 100-point scoring system to objectively rank MCP servers based on multiple quality indicators.

**Final Display**: Convert to 1-5 stars (20 points per star)

---

## Scoring Breakdown

### 1. GitHub Metrics (40 points)

#### Stars Score (15 points)
| Stars | Points |
|-------|--------|
| < 10 | 1 |
| 10-50 | 3 |
| 50-200 | 5 |
| 200-1,000 | 8 |
| 1,000+ | 15 |

#### Maintenance Score (15 points)
| Last Commit | Points |
|-------------|--------|
| > 1 year ago | 0 |
| 6-12 months | 5 |
| 3-6 months | 8 |
| 1-3 months | 12 |
| < 1 month | 15 |

#### Commit Frequency (10 points)
```
Formula: MIN(commits_per_month / 2, 10)
```
- Average commits per month, max 10 points

#### Issue/PR Velocity (5 points)
- Active issue triage: +3 points
- Open issues > 50: -2 points
- Good PR merge rate: +2 points

---

### 2. npm Downloads (25 points)

| Weekly Downloads | Points |
|-----------------|--------|
| < 100 | 1 |
| 100 - 1,000 | 3 |
| 1,000 - 10,000 | 8 |
| 10,000 - 100,000 | 15 |
| 100,000+ | 25 |

#### Growth Trend Bonus
- > 50% month-over-month growth (if monthly > 1k): +5 points

---

### 3. Community Sentiment (20 points)

#### GitHub Issues Sentiment (8 points)
Using VADER sentiment analysis on recent issues/discussions:
```
Score = (positive_issues / total_issues) * 8
```
- If negative/neutral >= 50%: -3 points

#### Blog/Article Mentions (7 points)
| Positive Mentions | Points |
|-------------------|--------|
| > 5 | 7 |
| 3-5 | 5 |
| 1-2 | 3 |
| Negative sentiment | -2 |

#### Reddit/HN Sentiment (5 points)
- Community recommendations: +1 point each (max 5)
- Complaints or issues: -1 point each

---

### 4. Documentation Quality (10 points)

#### README Completeness (5 points)
| Element | Points |
|---------|--------|
| Clear description | 1 |
| Installation instructions | 1 |
| Usage examples | 1 |
| API documentation | 1 |
| Troubleshooting section | 1 |

#### Contributing Guide (3 points)
- Has CONTRIBUTING.md: 3 points

#### License Clarity (2 points)
- Has clear LICENSE file: 2 points

---

### 5. Official Status (5 points)

| Status | Points |
|--------|--------|
| Anthropic-maintained | 5 |
| Official GitHub reference | 4 |
| Well-maintained by community | 3 |
| Actively developed | 2 |
| Archived/unmaintained | 0 |

---

## Score Tiers

| Tier | Score Range | Display | Placement |
|------|-------------|---------|-----------|
| Premium | 80-100 | 5 stars | Featured section |
| Recommended | 60-79 | 4 stars | Main listings |
| Emerging | 40-59 | 3 stars | Category listings |
| Basic | 20-39 | 2 stars | Lower listings |
| Archived | 0-19 | 1 star | Archive section |

---

## Implementation

### Data Sources

1. **GitHub API** (REST v3)
   - `/repos/{owner}/{repo}` - stars, forks, issues
   - `/repos/{owner}/{repo}/stats/commit_activity` - commits
   - Rate limit: 60/hr (unauth), 5000/hr (auth)

2. **npm Registry API**
   - `https://api.npmjs.org/downloads/point/last-week/{package}`

3. **Sentiment Analysis**
   - VADER for social media text
   - TextBlob for longer content

### TypeScript Interface

```typescript
interface ServerScore {
  serverId: string;

  // Component scores
  githubScore: number;      // 0-40
  npmScore: number;         // 0-25
  sentimentScore: number;   // 0-20
  docsScore: number;        // 0-10
  officialScore: number;    // 0-5

  // Totals
  totalScore: number;       // 0-100
  starRating: number;       // 1-5

  // Metadata
  calculatedAt: Date;
  dataVersion: string;
}
```

---

## Recalculation Schedule

- **Full recalculation**: Weekly (Sunday 00:00 UTC)
- **Incremental updates**: Daily for top 100 servers
- **On-demand**: When new server is added

---

## Last Updated: 2025-12-21
