import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const oauthToken = await db.oAuthToken.findUnique({
    where: { accessToken: token },
    include: { user: { select: { id: true, name: true, email: true, username: true, image: true } } },
  });

  if (!oauthToken || (oauthToken.expiresAt && oauthToken.expiresAt < new Date())) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { user } = oauthToken;
  return NextResponse.json({
    sub: user.id,
    name: user.name,
    email: oauthToken.scopes.includes("read_profile") ? user.email : undefined,
    username: user.username,
    picture: user.image,
  });
}
