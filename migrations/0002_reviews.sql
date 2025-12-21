-- MCPList D1 Database Schema
-- Migration for user reviews system

-- User reviews on MCP servers
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_image_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(server_id, user_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_reviews_server_id ON reviews(server_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Aggregated review stats per server (cached for performance)
CREATE TABLE IF NOT EXISTS review_stats (
  server_id TEXT PRIMARY KEY,
  review_count INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  rating_1_count INTEGER DEFAULT 0,
  rating_2_count INTEGER DEFAULT 0,
  rating_3_count INTEGER DEFAULT 0,
  rating_4_count INTEGER DEFAULT 0,
  rating_5_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Helpful votes on reviews
CREATE TABLE IF NOT EXISTS review_helpful (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  is_helpful INTEGER NOT NULL CHECK (is_helpful IN (0, 1)),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);
