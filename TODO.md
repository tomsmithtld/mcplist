# MCPList.site - Task Tracker

## Legend
- [ ] Not started
- [~] In progress
- [x] Completed

---

## Phase 1: Data Expansion ✅ COMPLETED

### 1.1 Find More MCP Servers ✅
- [x] Scrape punkpeye/awesome-mcp-servers (625 found)
- [x] Scrape wong2/awesome-mcp-servers (~450 found)
- [x] Scrape appcypher/awesome-mcp-servers (~200 found)
- [x] Scrape TensorBlock/awesome-mcp-servers
- [x] Parse user-provided README files with additional servers
- [x] Deduplicate entries by github_url
- [x] **Result: 35 → 258 servers (7.4x increase)**

### 1.2 Custom Scoring Algorithm ✅
- [x] Create scripts/fetch-github-metrics.ts
- [x] Implement GitHub metrics scoring (stars, recency)
- [x] Implement official status scoring
- [x] Add baseline documentation scoring
- [x] Convert 100-point to 1-5 stars
- [x] Update servers.json with scores

### 1.3 GitHub Metrics Collection ✅
- [x] Set up GitHub API integration (token configured)
- [x] Fetch stars, forks, issues for each server
- [x] Fetch last commit date (lastUpdated)
- [x] Fetch language and license
- [x] Store metrics in servers.json
- [x] **Result: 210 servers with full metrics**

### Rating Distribution
| Stars | Count |
|-------|-------|
| ⭐⭐⭐⭐⭐ (5) | 5 |
| ⭐⭐⭐⭐ (4) | 7 |
| ⭐⭐⭐ (3) | 75 |
| ⭐⭐ (2) | 132 |
| ⭐ (1) | 3 |

---

## Phase 2: User Features

### 2.1 User Reviews System ✅
- [x] Create migrations/0002_reviews.sql
- [x] Create app/api/reviews/route.ts
- [x] Create app/api/reviews/user/route.ts
- [x] Create components/ReviewForm.tsx
- [x] Create components/ReviewList.tsx
- [x] Create app/server/[id]/page.tsx (detail page with reviews)
- [x] Apply migration to D1 database
- [x] Aggregate user ratings in review_stats table

### 2.2 Favorites & Collections
- [ ] Create app/favorites/page.tsx
- [ ] Create app/api/favorites/route.ts
- [ ] Create app/collections/page.tsx
- [ ] Create app/api/collections/route.ts
- [ ] Add favorite button to ServerCard
- [ ] Build collection management UI

### 2.3 User Profile Enhancement
- [ ] Create app/profile/page.tsx
- [ ] Add user settings
- [ ] Show user's favorites
- [ ] Show user's reviews
- [ ] Export functionality

---

## Phase 3: Search & Discovery

### 3.1 Advanced Search Filters
- [ ] Create components/AdvancedFilters.tsx
- [ ] Filter by category (exists)
- [ ] Filter by official/community
- [ ] Filter by rating range
- [ ] Filter by stars count
- [ ] Filter by last updated
- [ ] Filter by language
- [ ] Sort options (score, stars, recent)

---

## Phase 4: Submit Flow Fix

### 4.1 In-App Submission
- [ ] Update app/submit/page.tsx
- [ ] Store in submissions table (exists)
- [ ] Build admin review interface
- [ ] Auto-import approved entries
- [ ] Status tracking for submitters

---

## Phase 5: Research-Based Scoring

### 5.1 Sentiment Collection
- [ ] Set up Tavily API integration
- [ ] Scrape GitHub issues for sentiment
- [ ] Analyze blog mentions
- [ ] Parse forum discussions
- [ ] Implement VADER sentiment analysis
- [ ] Update scores with sentiment data

---

## Phase 6: Content Expansion

### 6.1 Blog System
- [ ] Create app/blog/page.tsx
- [ ] Create app/blog/[slug]/page.tsx
- [ ] Set up MDX processing
- [ ] Write: "How to Build MCP Server"
- [ ] Write: "MCP Transport Methods"
- [ ] Write: "Top 10 MCP Servers"

### 6.2 Beyond MCP (Future)
- [ ] Evaluate adding Prompt Templates
- [ ] Evaluate adding Claude Code Tips
- [ ] Evaluate adding Hooks Library
- [ ] Consider domain name change

---

## Phase 7: Monetization Prep

### 7.1 Job Board
- [ ] Create app/jobs/page.tsx
- [ ] Create job submission flow
- [ ] Featured job placements

### 7.2 Advertising
- [ ] Add featured listing tier
- [ ] Implement affiliate links
- [ ] Create /advertise page

---

## Infrastructure Tasks

- [x] Deploy to Cloudflare Pages
- [x] Set up D1 database
- [x] Integrate Clerk auth
- [x] GitHub Actions CI/CD
- [x] Set up Tavily API (key in .env.local)
- [x] Set up GitHub token for API (fine-grained PAT in .env.local)

---

## Competitor Research

- [x] Analyze cursor.directory features
- [x] Document monetization methods
- [x] Create cursor.directory account (Tom Smith - tomsmithtld@gmail.com)
- [ ] Monitor competitor updates weekly

---

## Key Resources

- **Live Site**: https://mcplist.site
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **D1 Database ID**: ead56090-2958-4cf2-88eb-c7e0c524abb4
- **cursor.directory Account**: https://cursor.directory/u/tom-smith-a2e8b
- **Plan File**: /Users/aiops/.claude/plans/snuggly-frolicking-crab.md

---

## Last Updated: 2025-12-21 (Phase 1 + Phase 2.1 Complete + Production Deployed)

### Deployment Notes
- **Production URL**: https://mcplist.site
- **Server Count**: 222 servers (107 Official, 115 Community)
- **Deployment Method**: Manual upload via Cloudflare Pages dashboard
- **Edge Runtime**: Added to `/server/[id]/page.tsx` for Cloudflare compatibility
