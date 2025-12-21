# MCPList.site - Product Requirements Document

## For Laravel Backend Rewrite

**Purpose**: This document provides complete specifications for recreating the MCPList.site backend in Laravel while reusing the existing React UI components.

**Live Site**: https://mcplist.site
**Current Stack**: Next.js 16, Cloudflare Pages, D1 SQLite, Clerk Auth
**Target Stack**: Laravel, MySQL/PostgreSQL, Laravel Sanctum/Breeze

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Database Schema](#2-database-schema)
3. [API Contracts](#3-api-contracts)
4. [React Components Reference](#4-react-components-reference)
5. [Authentication Requirements](#5-authentication-requirements)
6. [Scoring Algorithm](#6-scoring-algorithm)
7. [Completed vs Outstanding Features](#7-completed-vs-outstanding-features)
8. [Server Data Structure](#8-server-data-structure)
9. [Environment Variables](#9-environment-variables)

---

## 1. Project Overview

### What is MCPList.site?

A directory website for MCP (Model Context Protocol) servers - tools that extend AI capabilities. Think of it like a "WordPress plugin directory" but for AI tools.

### Core Features (Implemented)

1. **Server Directory** - 222 MCP servers organized by category
2. **Search** - Full-text fuzzy search across name, description, tags
3. **Voting** - Reddit-style upvote/downvote system
4. **Reviews** - User reviews with 1-5 star ratings
5. **Server Detail Pages** - Individual pages for each server with GitHub stats

### User Flows

```
Homepage (/)
  → Browse servers by category
  → Search for servers
  → View grid/list layout
  → Click server → Server Detail Page (/server/[id])
      → View full description, install command, GitHub stats
      → Vote (requires auth)
      → Write/edit review (requires auth)
      → View all reviews
```

---

## 2. Database Schema

### Complete Schema (9 Tables)

```sql
-- ============================================
-- MCPList Database Schema
-- For Laravel Migration: php artisan make:migration
-- ============================================

-- VOTING SYSTEM
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,           -- MCP server ID (e.g., "filesystem")
    user_id TEXT NOT NULL,             -- Auth provider user ID
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(server_id, user_id)         -- One vote per user per server
);

CREATE TABLE vote_counts (
    server_id TEXT PRIMARY KEY,        -- Denormalized for performance
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,           -- upvotes - downvotes
    updated_at TEXT DEFAULT (datetime('now'))
);

-- SUBMISSIONS (for user-submitted servers)
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_url TEXT NOT NULL UNIQUE,
    name TEXT,
    description TEXT,
    category TEXT,
    tags TEXT,                         -- JSON array as string
    best_for TEXT,                     -- JSON array as string
    submitter_id TEXT NOT NULL,
    submitter_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- FAVORITES & COLLECTIONS (tables exist, UI not implemented)
CREATE TABLE favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, server_id)
);

CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 0,       -- 0 = private, 1 = public
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE collection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    server_id TEXT NOT NULL,
    added_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    UNIQUE(collection_id, server_id)
);

-- REVIEWS SYSTEM
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,                    -- Cached from auth provider
    user_image_url TEXT,               -- Cached avatar URL
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,                        -- Optional review title
    content TEXT,                      -- Optional review body
    helpful_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(server_id, user_id)         -- One review per user per server
);

CREATE TABLE review_stats (
    server_id TEXT PRIMARY KEY,        -- Denormalized aggregates
    review_count INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_5_count INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE review_helpful (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    is_helpful INTEGER NOT NULL CHECK (is_helpful IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE(review_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_votes_server_id ON votes(server_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitter ON submissions(submitter_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_reviews_server_id ON reviews(server_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_review_helpful_review ON review_helpful(review_id);
```

---

## 3. API Contracts

### 3.1 Votes API

#### GET /api/votes

Get vote counts for a server.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serverId | string | Yes | The server ID |

**Response (200 OK):**
```json
{
    "upvotes": 15,
    "downvotes": 3,
    "score": 12
}
```

**Response (No votes yet):**
```json
{
    "upvotes": 0,
    "downvotes": 0,
    "score": 0
}
```

---

#### POST /api/votes

Submit, change, or remove a vote. **Requires authentication.**

**Request Body:**
```json
{
    "serverId": "filesystem",
    "voteType": "up"  // "up" | "down" | "remove"
}
```

**Vote Behavior:**
- If user has no vote → Add new vote
- If user votes same type again → Remove vote (toggle off)
- If user votes different type → Change vote
- If voteType is "remove" → Remove existing vote

**Response (200 OK):**
```json
{
    "upvotes": 16,
    "downvotes": 3,
    "score": 13,
    "userVote": "up"  // "up" | "down" | null
}
```

**Response (401 Unauthorized):**
```json
{
    "error": "Authentication required"
}
```

**Response (400 Bad Request):**
```json
{
    "error": "serverId and voteType are required"
}
```

---

### 3.2 Reviews API

#### GET /api/reviews

Get reviews for a server with pagination.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| serverId | string | Yes | - | The server ID |
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Reviews per page (max 50) |

**Response (200 OK):**
```json
{
    "reviews": [
        {
            "id": 1,
            "server_id": "filesystem",
            "user_id": "user_abc123",
            "user_name": "John Doe",
            "user_image_url": "https://example.com/avatar.jpg",
            "rating": 5,
            "title": "Excellent server!",
            "content": "Works great for file operations...",
            "helpful_count": 3,
            "created_at": "2025-12-20T10:30:00Z",
            "updated_at": "2025-12-20T10:30:00Z"
        }
    ],
    "stats": {
        "server_id": "filesystem",
        "review_count": 5,
        "average_rating": 4.2,
        "rating_1_count": 0,
        "rating_2_count": 0,
        "rating_3_count": 1,
        "rating_4_count": 2,
        "rating_5_count": 2
    },
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 5,
        "totalPages": 1
    }
}
```

**Response (No reviews):**
```json
{
    "reviews": [],
    "stats": {
        "server_id": "filesystem",
        "review_count": 0,
        "average_rating": 0,
        "rating_1_count": 0,
        "rating_2_count": 0,
        "rating_3_count": 0,
        "rating_4_count": 0,
        "rating_5_count": 0
    },
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
    }
}
```

---

#### POST /api/reviews

Submit or update a review. **Requires authentication.**

One review per user per server. If user already has a review, it will be updated.

**Request Body:**
```json
{
    "serverId": "filesystem",
    "rating": 5,
    "title": "Great server!",      // Optional, max 100 chars
    "content": "Works perfectly..." // Optional, max 1000 chars
}
```

**Validation Rules:**
- `serverId`: Required
- `rating`: Required, integer 1-5
- `title`: Optional, max 100 characters
- `content`: Optional, max 1000 characters

**Response (200 OK) - New review:**
```json
{
    "success": true,
    "message": "Review submitted",
    "stats": {
        "server_id": "filesystem",
        "review_count": 6,
        "average_rating": 4.3,
        "rating_1_count": 0,
        "rating_2_count": 0,
        "rating_3_count": 1,
        "rating_4_count": 2,
        "rating_5_count": 3
    }
}
```

**Response (200 OK) - Updated review:**
```json
{
    "success": true,
    "message": "Review updated",
    "stats": { ... }
}
```

**Response (401 Unauthorized):**
```json
{
    "error": "Authentication required"
}
```

**Response (400 Bad Request):**
```json
{
    "error": "rating must be an integer between 1 and 5"
}
```

---

#### DELETE /api/reviews

Delete user's own review. **Requires authentication.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serverId | string | Yes | The server ID |

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Review deleted",
    "stats": { ... }
}
```

**Response (404 Not Found):**
```json
{
    "error": "Review not found"
}
```

---

#### GET /api/reviews/user

Get the current user's review for a specific server. **Requires authentication.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serverId | string | Yes | The server ID |

**Response (200 OK) - Has review:**
```json
{
    "review": {
        "id": 1,
        "server_id": "filesystem",
        "user_id": "user_abc123",
        "user_name": "John Doe",
        "user_image_url": "https://example.com/avatar.jpg",
        "rating": 5,
        "title": "Excellent!",
        "content": "Works great...",
        "helpful_count": 0,
        "created_at": "2025-12-20T10:30:00Z",
        "updated_at": "2025-12-20T10:30:00Z"
    }
}
```

**Response (200 OK) - No review:**
```json
{
    "review": null
}
```

---

### 3.3 Review Stats Aggregation Logic

When a review is created, updated, or deleted, the `review_stats` table must be updated:

```
On CREATE:
  - Increment review_count
  - Increment rating_X_count for the new rating
  - Recalculate average_rating

On UPDATE:
  - Decrement old rating_X_count
  - Increment new rating_X_count
  - Recalculate average_rating

On DELETE:
  - Decrement review_count
  - Decrement rating_X_count for deleted rating
  - Recalculate average_rating

Average calculation:
  average = (1*r1 + 2*r2 + 3*r3 + 4*r4 + 5*r5) / review_count
```

---

## 4. React Components Reference

These React components will be reused. They expect the API contracts above.

### 4.1 VoteButtons

**File**: `components/VoteButtons.tsx`

**Props:**
```typescript
interface VoteButtonsProps {
    serverId: string;      // MCP server ID
    compact?: boolean;     // Compact horizontal layout vs vertical
    initialScore?: number; // Initial score before API loads
}
```

**API Calls Made:**
- On mount: `GET /api/votes?serverId={serverId}`
- On vote: `POST /api/votes` with `{ serverId, voteType }`

**Behavior:**
- Displays upvote/downvote buttons with score
- Shows sign-in modal if user clicks while not authenticated
- Optimistic UI updates (updates UI immediately, rolls back on error)
- Toggle behavior (clicking same vote removes it)

---

### 4.2 ReviewForm

**File**: `components/ReviewForm.tsx`

**Props:**
```typescript
interface ReviewFormProps {
    serverId: string;
    serverName: string;
    existingReview?: {
        rating: number;
        title: string | null;
        content: string | null;
    } | null;
    onSubmit?: (stats: ReviewStats) => void;  // Called after successful submit
    onCancel?: () => void;
}
```

**API Calls Made:**
- On submit: `POST /api/reviews` with `{ serverId, rating, title, content }`

**Behavior:**
- Shows sign-in prompt if not authenticated
- Star rating picker (1-5, required)
- Optional title (max 100 chars)
- Optional content (max 1000 chars)
- Shows character count for content
- Success/error states
- Pre-fills form if editing existing review

---

### 4.3 ReviewList

**File**: `components/ReviewList.tsx`

**Props:**
```typescript
interface ReviewListProps {
    serverId: string;
    serverName: string;
}
```

**API Calls Made:**
- On mount: `GET /api/reviews?serverId={serverId}&page=1&limit=5`
- On mount (if signed in): `GET /api/reviews/user?serverId={serverId}`
- On pagination: `GET /api/reviews?serverId={serverId}&page={n}&limit=5`

**UI Elements:**
- Stats summary box (average rating, distribution bar chart)
- "Write a review" / "Edit your review" button
- Paginated list of reviews
- Highlights user's own review with accent border

---

### 4.4 SearchBar

**File**: `components/SearchBar.tsx`

**Props:**
```typescript
interface SearchBarProps {
    servers: Server[];           // Full server list for client-side search
    onSearch: (results: Server[]) => void;
    onCategoryFilter: (category: string) => void;
    selectedCategory: string;
}
```

**Behavior:**
- Uses MiniSearch library for client-side fuzzy search
- Searches across: name, description, author, tags, bestFor
- Field boosting: name (3x), description (2x), others (1x)
- Category filter pills

**Note for Laravel**: You may want server-side search instead. The React component would need modification to call an API.

---

### 4.5 ServerCard

**File**: `components/ServerCard.tsx`

**Props:**
```typescript
interface Server {
    id: string;
    name: string;
    description: string;
    category: string;
    author: string;
    authorUrl: string;
    githubUrl: string;
    installCommand: string;
    isOfficial: boolean;
    tags: string[];
    bestFor: string[];
    rating: number;  // 1-5 algorithm score
}
```

**UI Elements:**
- VoteButtons component
- Server name with link to detail page
- Official/Community badge
- Description (truncated)
- Rating dots (1-5)
- Install command with copy button
- GitHub link

---

### 4.6 ServerListItem

**File**: `components/ServerListItem.tsx`

Same props as ServerCard, but horizontal list layout instead of grid card.

---

## 5. Authentication Requirements

### Protected Endpoints

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| /api/votes | GET | No |
| /api/votes | POST | **Yes** |
| /api/reviews | GET | No |
| /api/reviews | POST | **Yes** |
| /api/reviews | DELETE | **Yes** |
| /api/reviews/user | GET | **Yes** |

### User Data from Auth Provider

The reviews system caches user display info:

```typescript
// From Clerk (current implementation)
const userName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.username || "Anonymous";
const userImageUrl = user.imageUrl || null;
const userId = user.id;  // e.g., "user_abc123xyz"
```

For Laravel, map from your auth provider (Sanctum, Breeze, Socialite):

```php
// Laravel equivalent
$userName = $user->name ?? 'Anonymous';
$userImageUrl = $user->avatar ?? null;
$userId = (string) $user->id;
```

---

## 6. Scoring Algorithm

Servers have an "algorithm score" (1-5 stars) based on GitHub metrics.

### Implementation

```typescript
// scripts/fetch-github-metrics.ts (lines 89-135)

function calculateScore(server: ServerData): number {
    let score = 0;

    // GitHub Stars (15 points max)
    const stars = server.stars || 0;
    if (stars >= 1000) score += 15;
    else if (stars >= 200) score += 8;
    else if (stars >= 50) score += 5;
    else if (stars >= 10) score += 3;
    else if (stars > 0) score += 1;

    // Maintenance/Recency (15 points max)
    if (server.lastUpdated) {
        const lastUpdate = new Date(server.lastUpdated);
        const now = new Date();
        const monthsAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (monthsAgo <= 1) score += 15;
        else if (monthsAgo <= 3) score += 12;
        else if (monthsAgo <= 6) score += 8;
        else if (monthsAgo <= 12) score += 5;
        // Older than 12 months: 0 points
    }

    // Official Status (5 points)
    if (server.isOfficial) score += 5;

    // Documentation (10 points estimated)
    if (server.isOfficial) score += 8;
    else if (server.description && server.description.length > 50) score += 5;
    else score += 3;

    // Baseline community score
    score += 10;

    return Math.min(score, 100);
}

function scoreToRating(score: number): number {
    if (score >= 80) return 5;  // Never achievable currently
    if (score >= 60) return 4;  // Rare
    if (score >= 40) return 3;  // Common
    if (score >= 20) return 2;  // Common
    return 1;                    // Rare
}
```

### Score Breakdown

| Factor | Max Points | Logic |
|--------|------------|-------|
| GitHub Stars | 15 | 1000+: 15, 200+: 8, 50+: 5, 10+: 3, >0: 1 |
| Recency | 15 | <=1mo: 15, <=3mo: 12, <=6mo: 8, <=12mo: 5 |
| Official Status | 5 | Official: 5, Community: 0 |
| Documentation | 10 | Official: 8, desc>50chars: 5, else: 3 |
| Base Score | 10 | Everyone gets 10 |
| **Max Achievable** | **53-58** | Most servers score 30-50 |

### Star Conversion

| Score Range | Stars |
|-------------|-------|
| 80-100 | 5 stars |
| 60-79 | 4 stars |
| 40-59 | 3 stars |
| 20-39 | 2 stars |
| 0-19 | 1 star |

### Current Distribution (222 servers)

| Rating | Count |
|--------|-------|
| 5 stars | 5 |
| 4 stars | 7 |
| 3 stars | 75 |
| 2 stars | 132 |
| 1 star | 3 |

---

## 7. Completed vs Outstanding Features

### COMPLETED (Ready to Use)

| Feature | Description | Files |
|---------|-------------|-------|
| Server Directory | 222 servers with categories | `data/servers.json` |
| Search | Client-side fuzzy text search | `components/SearchBar.tsx` |
| Voting | Upvote/downvote with auth | `app/api/votes/route.ts`, `components/VoteButtons.tsx` |
| Reviews | 1-5 star ratings with text | `app/api/reviews/route.ts`, `components/ReviewForm.tsx`, `components/ReviewList.tsx` |
| Server Detail | Full info, GitHub stats, reviews | `app/server/[id]/page.tsx` |
| Auth Integration | Clerk auth (replace with Laravel) | Middleware + API routes |

### NOT IMPLEMENTED (Planned)

| Feature | Tables Exist | What's Needed |
|---------|--------------|---------------|
| Favorites | Yes | API routes (`/api/favorites`), UI page (`/favorites`) |
| Collections | Yes | API routes (`/api/collections`), UI pages |
| Advanced Filters | No | Filter by rating, stars, language, last updated |
| In-App Submission | Yes | Update submit page to use DB instead of GitHub redirect |
| Admin Panel | No | Review submissions, manage servers |
| Blog | No | MDX setup, `/blog` routes |
| Job Board | No | New tables, submission flow |

---

## 8. Server Data Structure

Servers are stored in `data/servers.json`:

```json
{
    "metadata": {
        "version": "2.0",
        "lastUpdated": "2025-12-21",
        "totalServers": 222,
        "officialCount": 107,
        "communityCount": 115
    },
    "servers": [
        {
            "id": "filesystem",
            "name": "Filesystem",
            "description": "Read, write, and manage files...",
            "category": "filesystem",
            "author": "Anthropic",
            "authorUrl": "https://github.com/anthropics",
            "githubUrl": "https://github.com/anthropics/mcp-filesystem",
            "npmPackage": "@anthropic/mcp-filesystem",
            "installCommand": "npx @anthropic/mcp-filesystem",
            "isOfficial": true,
            "tags": ["files", "directory", "read", "write"],
            "bestFor": ["File operations", "Directory management"],
            "rating": 4,
            "stars": 1523,
            "forks": 234,
            "openIssues": 12,
            "lastUpdated": "2025-12-15",
            "language": "TypeScript",
            "license": "MIT",
            "score": 48
        }
    ]
}
```

### Categories

```typescript
const categories = [
    'filesystem',
    'database',
    'browser-automation',
    'cloud-platforms',
    'version-control',
    'communication',
    'search',
    'ai-tools',
    'code-execution',
    'media',
    'productivity',
    'utilities'
];
```

---

## 9. Environment Variables

### For Laravel Backend

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mcplist
DB_USERNAME=root
DB_PASSWORD=

# GitHub API (for metrics collection script)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Tavily API (future: sentiment analysis)
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxx

# App
APP_URL=https://mcplist.site
```

### Original Next.js Variables (for reference)

```env
# Clerk Authentication (replace with Laravel auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Cloudflare (not needed for Laravel)
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ACCOUNT_ID=97dc37018363dfc78980a63e1c9a7954
```

---

## Quick Start for Laravel Rewrite

1. **Create Laravel project**
   ```bash
   laravel new mcplist
   cd mcplist
   ```

2. **Run migrations** (copy schema from Section 2)
   ```bash
   php artisan make:migration create_votes_table
   # etc.
   ```

3. **Create API routes** (implement contracts from Section 3)
   ```php
   // routes/api.php
   Route::get('/votes', [VoteController::class, 'index']);
   Route::post('/votes', [VoteController::class, 'store'])->middleware('auth:sanctum');
   Route::get('/reviews', [ReviewController::class, 'index']);
   Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');
   Route::delete('/reviews', [ReviewController::class, 'destroy'])->middleware('auth:sanctum');
   Route::get('/reviews/user', [ReviewController::class, 'userReview'])->middleware('auth:sanctum');
   ```

4. **Copy React components** from `components/` directory

5. **Set up Inertia.js or API-only** for React integration

6. **Import server data** from `data/servers.json`

---

## File Reference

| Current File | Purpose | Laravel Equivalent |
|--------------|---------|-------------------|
| `app/api/votes/route.ts` | Votes API | `VoteController.php` |
| `app/api/reviews/route.ts` | Reviews API | `ReviewController.php` |
| `app/api/reviews/user/route.ts` | User review API | `ReviewController@userReview` |
| `components/VoteButtons.tsx` | Vote UI | Keep as-is (React) |
| `components/ReviewForm.tsx` | Review form | Keep as-is (React) |
| `components/ReviewList.tsx` | Review list | Keep as-is (React) |
| `components/SearchBar.tsx` | Search UI | May need API |
| `components/ServerCard.tsx` | Server card | Keep as-is (React) |
| `data/servers.json` | Server data | Import to DB or keep as JSON |
| `scripts/fetch-github-metrics.ts` | GitHub scraper | Convert to Laravel command |

---

**Document Version**: 1.0
**Last Updated**: 2025-12-21
**Author**: AI Assistant
**For**: Laravel Backend Rewrite
