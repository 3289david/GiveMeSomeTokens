import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawCreatorId = searchParams.get("creatorId");
  const session = await auth();

  let creatorId = rawCreatorId;
  const isOwner = rawCreatorId === "me";

  if (rawCreatorId === "me") {
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    creatorId = session.user.id;
  }

  // Get member tiers of current user for this creator
  let memberTierIds: string[] = [];
  if (!isOwner && session?.user?.id && creatorId) {
    const subs = await db.subscription.findMany({
      where: { supporterId: session.user.id, creatorId, active: true, tierId: { not: null } },
      select: { tierId: true },
    });
    memberTierIds = subs.map(s => s.tierId!).filter(Boolean);
  }

  const posts = await db.post.findMany({
    where: { ...(creatorId ? { creatorId } : {}) },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { memberTier: { select: { id: true, name: true, color: true, emoji: true } } },
  });

  // For each post, decide if viewer can see full content
  const result = posts.map(p => ({
    ...p,
    locked: !isOwner && !p.isPublic && !memberTierIds.includes(p.tierId ?? ""),
    content: (!isOwner && !p.isPublic && !memberTierIds.includes(p.tierId ?? "")) ? null : p.content,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const { title, content, excerpt, isPublic, tierId, isPinned } = await req.json();
  if (!title?.trim() || !content?.trim()) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

  const post = await db.post.create({
    data: {
      creatorId: userId,
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim(),
      isPublic: isPublic !== false,
      tierId: tierId || null,
      isPinned: isPinned || false,
    },
  });
  return NextResponse.json(post);
}
