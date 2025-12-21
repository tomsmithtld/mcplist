import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface Env {
  DB: D1Database;
}

// GET /api/votes/user?serverId=xxx - Get user's vote for a server
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ userVote: null });
  }

  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get("serverId");

  if (!serverId) {
    return NextResponse.json({ error: "serverId is required" }, { status: 400 });
  }

  try {
    const { env } = getRequestContext() as { env: Env };

    const result = await env.DB.prepare(
      "SELECT vote_type FROM votes WHERE server_id = ? AND user_id = ?"
    ).bind(serverId, userId).first();

    return NextResponse.json({
      userVote: result?.vote_type || null,
    });
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return NextResponse.json({ userVote: null });
  }
}
