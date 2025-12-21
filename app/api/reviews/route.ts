import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface Env {
  DB: D1Database;
}

interface Review {
  id: number;
  server_id: string;
  user_id: string;
  user_name: string | null;
  user_image_url: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface ReviewStats {
  server_id: string;
  review_count: number;
  average_rating: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
}

// GET /api/reviews?serverId=xxx - Get reviews for a server
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  if (!serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext() as { env: Env };

    // Get reviews with pagination
    const reviews = await env.DB.prepare(`
      SELECT id, server_id, user_id, user_name, user_image_url, rating, title, content, helpful_count, created_at, updated_at
      FROM reviews
      WHERE server_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(serverId, limit, offset).all();

    // Get review stats
    const stats = await env.DB.prepare(`
      SELECT server_id, review_count, average_rating, rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count
      FROM review_stats
      WHERE server_id = ?
    `).bind(serverId).first() as ReviewStats | null;

    // Get total count for pagination
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM reviews WHERE server_id = ?
    `).bind(serverId).first();

    return NextResponse.json({
      reviews: reviews.results || [],
      stats: stats || {
        server_id: serverId,
        review_count: 0,
        average_rating: 0,
        rating_1_count: 0,
        rating_2_count: 0,
        rating_3_count: 0,
        rating_4_count: 0,
        rating_5_count: 0,
      },
      pagination: {
        page,
        limit,
        total: (countResult?.total as number) || 0,
        totalPages: Math.ceil(((countResult?.total as number) || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({
      reviews: [],
      stats: {
        server_id: serverId,
        review_count: 0,
        average_rating: 0,
        rating_1_count: 0,
        rating_2_count: 0,
        rating_3_count: 0,
        rating_4_count: 0,
        rating_5_count: 0,
      },
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}

// POST /api/reviews - Submit a review (requires authentication)
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json() as {
      serverId?: string;
      rating?: number;
      title?: string;
      content?: string;
    };
    const { serverId, rating, title, content } = body;

    if (!serverId || !rating) {
      return NextResponse.json(
        { error: "serverId and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: "rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const { env } = getRequestContext() as { env: Env };

    // Get user info from Clerk
    const userName = user?.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
      : user?.username || "Anonymous";
    const userImageUrl = user?.imageUrl || null;

    // Check for existing review
    const existingReview = await env.DB.prepare(
      "SELECT id, rating FROM reviews WHERE server_id = ? AND user_id = ?"
    ).bind(serverId, userId).first();

    const oldRating = existingReview?.rating as number | null;

    if (existingReview) {
      // Update existing review
      await env.DB.prepare(`
        UPDATE reviews
        SET rating = ?, title = ?, content = ?, user_name = ?, user_image_url = ?, updated_at = datetime('now')
        WHERE server_id = ? AND user_id = ?
      `).bind(rating, title || null, content || null, userName, userImageUrl, serverId, userId).run();
    } else {
      // Insert new review
      await env.DB.prepare(`
        INSERT INTO reviews (server_id, user_id, user_name, user_image_url, rating, title, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(serverId, userId, userName, userImageUrl, rating, title || null, content || null).run();
    }

    // Update review stats
    await updateReviewStats(env.DB, serverId, rating, oldRating);

    // Get updated stats
    const stats = await env.DB.prepare(`
      SELECT * FROM review_stats WHERE server_id = ?
    `).bind(serverId).first() as ReviewStats | null;

    return NextResponse.json({
      success: true,
      message: existingReview ? "Review updated" : "Review submitted",
      stats,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews - Delete a review (requires authentication)
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return NextResponse.json(
        { error: "serverId is required" },
        { status: 400 }
      );
    }

    const { env } = getRequestContext() as { env: Env };

    // Get existing review to know the rating
    const existingReview = await env.DB.prepare(
      "SELECT id, rating FROM reviews WHERE server_id = ? AND user_id = ?"
    ).bind(serverId, userId).first();

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const oldRating = existingReview.rating as number;

    // Delete the review
    await env.DB.prepare(
      "DELETE FROM reviews WHERE server_id = ? AND user_id = ?"
    ).bind(serverId, userId).run();

    // Update stats (pass null for new rating to indicate deletion)
    await updateReviewStats(env.DB, serverId, null, oldRating);

    // Get updated stats
    const stats = await env.DB.prepare(`
      SELECT * FROM review_stats WHERE server_id = ?
    `).bind(serverId).first() as ReviewStats | null;

    return NextResponse.json({
      success: true,
      message: "Review deleted",
      stats,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

// Helper function to update review stats
async function updateReviewStats(
  db: D1Database,
  serverId: string,
  newRating: number | null,
  oldRating: number | null
) {
  // Get current stats or create new ones
  const currentStats = await db.prepare(`
    SELECT * FROM review_stats WHERE server_id = ?
  `).bind(serverId).first() as ReviewStats | null;

  let reviewCount = currentStats?.review_count || 0;
  const ratingCounts = [
    currentStats?.rating_1_count || 0,
    currentStats?.rating_2_count || 0,
    currentStats?.rating_3_count || 0,
    currentStats?.rating_4_count || 0,
    currentStats?.rating_5_count || 0,
  ];

  // Adjust for old rating (decrement)
  if (oldRating !== null && oldRating >= 1 && oldRating <= 5) {
    ratingCounts[oldRating - 1] = Math.max(0, ratingCounts[oldRating - 1] - 1);
    if (newRating === null) {
      // Deletion case
      reviewCount = Math.max(0, reviewCount - 1);
    }
  }

  // Adjust for new rating (increment)
  if (newRating !== null && newRating >= 1 && newRating <= 5) {
    ratingCounts[newRating - 1]++;
    if (oldRating === null) {
      // New review case
      reviewCount++;
    }
  }

  // Calculate average
  const totalRatingSum =
    ratingCounts[0] * 1 +
    ratingCounts[1] * 2 +
    ratingCounts[2] * 3 +
    ratingCounts[3] * 4 +
    ratingCounts[4] * 5;
  const averageRating = reviewCount > 0 ? totalRatingSum / reviewCount : 0;

  // Upsert stats
  await db.prepare(`
    INSERT INTO review_stats (server_id, review_count, average_rating, rating_1_count, rating_2_count, rating_3_count, rating_4_count, rating_5_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(server_id) DO UPDATE SET
      review_count = excluded.review_count,
      average_rating = excluded.average_rating,
      rating_1_count = excluded.rating_1_count,
      rating_2_count = excluded.rating_2_count,
      rating_3_count = excluded.rating_3_count,
      rating_4_count = excluded.rating_4_count,
      rating_5_count = excluded.rating_5_count,
      updated_at = datetime('now')
  `).bind(
    serverId,
    reviewCount,
    averageRating,
    ratingCounts[0],
    ratingCounts[1],
    ratingCounts[2],
    ratingCounts[3],
    ratingCounts[4]
  ).run();
}
