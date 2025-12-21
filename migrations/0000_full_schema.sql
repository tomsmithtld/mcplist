-- ============================================
-- MCPList.site - Complete Database Schema
-- ============================================
-- Verified from production D1: 2025-12-21
-- Database ID: ead56090-2958-4cf2-88eb-c7e0c524abb4
--
-- This file contains the complete schema for all 9 tables.
-- Use this as the source of truth for Laravel migrations.
-- ============================================

-- ============================================
-- VOTING SYSTEM (2 tables)
-- ============================================

-- Individual votes from users
CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,                    -- MCP server ID (e.g., "filesystem")
    user_id TEXT NOT NULL,                      -- Auth provider user ID (e.g., "user_abc123")
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(server_id, user_id)                  -- One vote per user per server
);

-- Denormalized vote counts for performance
-- Updated whenever votes table changes
CREATE TABLE IF NOT EXISTS vote_counts (
    server_id TEXT PRIMARY KEY,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,                    -- = upvotes - downvotes
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- SUBMISSIONS SYSTEM (1 table)
-- ============================================

-- User-submitted MCP servers pending review
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_url TEXT NOT NULL UNIQUE,            -- GitHub repo URL
    name TEXT,                                   -- Server name
    description TEXT,                            -- Server description
    category TEXT,                               -- Category slug
    tags TEXT,                                   -- JSON array as string: ["tag1", "tag2"]
    best_for TEXT,                               -- JSON array as string: ["use case 1", "use case 2"]
    submitter_id TEXT NOT NULL,                  -- User who submitted
    submitter_email TEXT,                        -- Optional contact email
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,                           -- Admin notes
    reviewed_by TEXT,                            -- Admin user ID
    reviewed_at TEXT,                            -- Review timestamp
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- FAVORITES & COLLECTIONS (3 tables)
-- Note: Tables exist but UI not yet implemented
-- ============================================

-- Simple favorites (bookmarks)
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    server_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, server_id)                  -- One favorite per user per server
);

-- User-created collections (like playlists)
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,                      -- Collection owner
    name TEXT NOT NULL,                         -- Collection name
    description TEXT,                           -- Optional description
    is_public INTEGER DEFAULT 0,                -- 0 = private, 1 = public
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Servers in collections (many-to-many)
CREATE TABLE IF NOT EXISTS collection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    server_id TEXT NOT NULL,
    added_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    UNIQUE(collection_id, server_id)            -- Server can only be in collection once
);

-- ============================================
-- REVIEWS SYSTEM (3 tables)
-- ============================================

-- Individual reviews from users
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,                             -- Cached display name from auth provider
    user_image_url TEXT,                        -- Cached avatar URL from auth provider
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,                                 -- Optional review title (max 100 chars)
    content TEXT,                               -- Optional review body (max 1000 chars)
    helpful_count INTEGER DEFAULT 0,            -- Number of "helpful" votes
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(server_id, user_id)                  -- One review per user per server
);

-- Denormalized review statistics for performance
-- Updated whenever reviews table changes
CREATE TABLE IF NOT EXISTS review_stats (
    server_id TEXT PRIMARY KEY,
    review_count INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,              -- Calculated: (1*r1 + 2*r2 + ... + 5*r5) / count
    rating_1_count INTEGER DEFAULT 0,           -- Count of 1-star reviews
    rating_2_count INTEGER DEFAULT 0,           -- Count of 2-star reviews
    rating_3_count INTEGER DEFAULT 0,           -- Count of 3-star reviews
    rating_4_count INTEGER DEFAULT 0,           -- Count of 4-star reviews
    rating_5_count INTEGER DEFAULT 0,           -- Count of 5-star reviews
    updated_at TEXT DEFAULT (datetime('now'))
);

-- "Was this review helpful?" votes
CREATE TABLE IF NOT EXISTS review_helpful (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    review_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    is_helpful INTEGER NOT NULL CHECK (is_helpful IN (0, 1)),  -- 0 = not helpful, 1 = helpful
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    UNIQUE(review_id, user_id)                  -- One vote per user per review
);

-- ============================================
-- INDEXES (12 total)
-- ============================================

-- Voting indexes
CREATE INDEX IF NOT EXISTS idx_votes_server_id ON votes(server_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter ON submissions(submitter_id);

-- Favorites & collections indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_server_id ON reviews(server_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);

-- ============================================
-- LARAVEL MIGRATION NOTES
-- ============================================
--
-- For Laravel, convert each CREATE TABLE to a migration:
--
--   php artisan make:migration create_votes_table
--   php artisan make:migration create_vote_counts_table
--   php artisan make:migration create_submissions_table
--   php artisan make:migration create_favorites_table
--   php artisan make:migration create_collections_table
--   php artisan make:migration create_collection_items_table
--   php artisan make:migration create_reviews_table
--   php artisan make:migration create_review_stats_table
--   php artisan make:migration create_review_helpful_table
--
-- Key differences for Laravel:
-- - Use $table->id() instead of INTEGER PRIMARY KEY AUTOINCREMENT
-- - Use $table->timestamps() for created_at/updated_at
-- - Use $table->unique(['field1', 'field2']) for composite unique constraints
-- - Use $table->foreignId('collection_id')->constrained()->cascadeOnDelete()
--
-- Example Laravel migration for votes:
--
--   Schema::create('votes', function (Blueprint $table) {
--       $table->id();
--       $table->string('server_id');
--       $table->string('user_id');
--       $table->enum('vote_type', ['up', 'down']);
--       $table->timestamps();
--       $table->unique(['server_id', 'user_id']);
--       $table->index('server_id');
--       $table->index('user_id');
--   });
--
-- ============================================
