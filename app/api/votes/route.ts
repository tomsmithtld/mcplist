import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface Env {
  DB: D1Database;
}

// GET /api/votes?serverId=xxx - Get vote count for a server
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId");

  if (!serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext() as { env: Env };

    // Get cached vote count
    const result = await env.DB.prepare(
      "SELECT upvotes, downvotes, score FROM vote_counts WHERE server_id = ?"
    ).bind(serverId).first();

    if (result) {
      return NextResponse.json({
        upvotes: result.upvotes,
        downvotes: result.downvotes,
        score: result.score,
      });
    }

    return NextResponse.json({ upvotes: 0, downvotes: 0, score: 0 });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ upvotes: 0, downvotes: 0, score: 0 });
  }
}

// POST /api/votes - Submit a vote (requires authentication)
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json() as { serverId?: string; voteType?: string };
    const { serverId, voteType } = body;

    if (!serverId || !voteType) {
      return NextResponse.json(
        { error: "serverId and voteType are required" },
        { status: 400 }
      );
    }

    if (voteType !== "up" && voteType !== "down" && voteType !== "remove") {
      return NextResponse.json(
        { error: "voteType must be 'up', 'down', or 'remove'" },
        { status: 400 }
      );
    }

    const { env } = getRequestContext() as { env: Env };

    // Get existing vote
    const existingVote = await env.DB.prepare(
      "SELECT vote_type FROM votes WHERE server_id = ? AND user_id = ?"
    ).bind(serverId, userId).first();

    const oldVoteType = existingVote?.vote_type as string | null;

    if (voteType === "remove") {
      // Remove vote
      if (oldVoteType) {
        await env.DB.prepare(
          "DELETE FROM votes WHERE server_id = ? AND user_id = ?"
        ).bind(serverId, userId).run();
      }
    } else if (oldVoteType === voteType) {
      // Toggle off (same vote = remove)
      await env.DB.prepare(
        "DELETE FROM votes WHERE server_id = ? AND user_id = ?"
      ).bind(serverId, userId).run();
    } else if (oldVoteType) {
      // Change vote
      await env.DB.prepare(
        "UPDATE votes SET vote_type = ?, updated_at = datetime('now') WHERE server_id = ? AND user_id = ?"
      ).bind(voteType, serverId, userId).run();
    } else {
      // New vote
      await env.DB.prepare(
        "INSERT INTO votes (server_id, user_id, vote_type) VALUES (?, ?, ?)"
      ).bind(serverId, userId, voteType).run();
    }

    // Recalculate vote counts
    const counts = await env.DB.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes
      FROM votes WHERE server_id = ?
    `).bind(serverId).first();

    const upvotes = (counts?.upvotes as number) || 0;
    const downvotes = (counts?.downvotes as number) || 0;
    const score = upvotes - downvotes;

    // Update or insert vote_counts cache
    await env.DB.prepare(`
      INSERT INTO vote_counts (server_id, upvotes, downvotes, score, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(server_id) DO UPDATE SET
        upvotes = excluded.upvotes,
        downvotes = excluded.downvotes,
        score = excluded.score,
        updated_at = datetime('now')
    `).bind(serverId, upvotes, downvotes, score).run();

    // Get user's current vote
    const userVote = await env.DB.prepare(
      "SELECT vote_type FROM votes WHERE server_id = ? AND user_id = ?"
    ).bind(serverId, userId).first();

    return NextResponse.json({
      upvotes,
      downvotes,
      score,
      userVote: userVote?.vote_type || null,
    });
  } catch (error) {
    console.error("Error submitting vote:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}
