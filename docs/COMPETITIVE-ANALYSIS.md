# Competitive Analysis: cursor.directory

## Overview

cursor.directory is the leading directory for Cursor IDE resources, generating $35k/month ($420k/year) as a side project.

**Creator**: Pontus Abrahamsson (@pontusab)
**Started**: As a "3-hour hack"
**Traffic**: 250,000+ unique monthly visitors
**Members**: 67,400+ registered users

---

## Content Types

| Category | Count | Description |
|----------|-------|-------------|
| Rules | 1000+ | Cursor project rules by tech stack |
| MCPs | 1800+ | Model Context Protocol servers |
| Jobs | Dozens | Featured developer positions |
| Board/Trending | Active | Community posts with voting |
| Members | 67.4k+ | Registered community members |
| Learn | 50+ | Curated YouTube tutorials |
| Companies | Directory | Companies with job listings |

---

## Monetization Methods

### 1. Job Board (Primary)
- Companies pay for featured job listings
- High-profile companies: Cursor, Shortwave, Resend, Speakeasy
- UTM tracking: `?utm_source=cursor.directory&utm_medium=referral&utm_campaign=jobs-featured`

### 2. Advertising / Sponsored Content
- Ad slots purchasable via Polar: https://buy.polar.sh/polar_cl_XZNMJtIvsTBndqeeVF5Xf1CNMBzpb0N69IpOc0hhCpX
- Sponsored placements in rules lists (e.g., Endgame, Sentry, RunPod, CodeRabbit)
- Newsletter sponsorships

### 3. Affiliate Links
- Brand.dev
- CodeRabbit
- Sentry
- Polar
- Midday
- BrainGrid

### 4. Custom Partnerships
- Direct deals with companies
- Contact: @pontusab on Twitter

---

## Audience Demographics

- 65% Software Engineers & Developers
- 20% Technical Leaders & Engineering Managers
- 10% Startup Founders & CTOs
- 5% Other Technical Professionals

---

## Authentication Features

**Sign-in Options**: GitHub OAuth, Google OAuth

### Features by Auth Status

| Feature | Auth Required |
|---------|---------------|
| Browse content | No |
| Search | No |
| Submit MCP | YES |
| Post Job | YES |
| Create Board Post | YES |
| Generate Rules | YES |
| Vote on Posts | YES |
| Follow Users | YES |

---

## User Profile Features

Profiles include:
- Avatar (from OAuth)
- Display Name (editable)
- Username (URL slug)
- Status, Bio, Work fields
- Website, X Profile links
- Following/Followers counts
- Activity tabs: Posts, Companies
- Public/Private toggle

---

## Generate Tool (Unique Feature)

The `/generate` page is a key differentiator:
- Upload `.cursorrules`, `package.json`, `requirements.txt`
- AI generates `.mdc` project rules
- Sponsored by CodeRabbit

**Opportunity**: mcplist.site could create "Generate MCP Config" tool

---

## Key Success Patterns

1. **No paywall** - Everything free to browse
2. **Auth for contribution** - Sign-in only for adding content
3. **Social features** - Following, profiles, activity feeds
4. **Community content** - User-generated rules/MCPs drive growth
5. **Public analytics** - Transparency builds advertiser trust
6. **Multiple content types** - Rules + MCPs + Jobs + Board = stickiness
7. **AI tool** - Generate feature adds utility
8. **Affiliate integration** - Subtle monetization

---

## Technical Details

- **Backend**: Supabase (visible in OAuth flow)
- **Frontend**: Next.js
- **GitHub**: https://github.com/pontusab/cursor.directory
- **Analytics**: OpenPanel (public dashboard)

---

## Our Account

**Email**: tomsmithtld@gmail.com
**Profile**: https://cursor.directory/u/tom-smith-a2e8b
**Created**: Dec 21, 2025

---

## Last Updated: 2025-12-21
