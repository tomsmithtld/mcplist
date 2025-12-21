import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface Env {
  DB: D1Database;
}

// GET /api/reviews/user?serverId=xxx - Get user's own review for a server
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ review: null });
  }

  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId");

  if (!serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext() as { env: Env };

    const review = await env.DB.prepare(`
      SELECT id, server_id, user_id, user_name, user_image_url, rating, title, content, helpful_count, created_at, updated_at
      FROM reviews
      WHERE server_id = ? AND user_id = ?
    `).bind(serverId, userId).first();

    return NextResponse.json({ review: review || null });
  } catch (error) {
    console.error("Error fetching user review:", error);
    return NextResponse.json({ review: null });
  }
}
