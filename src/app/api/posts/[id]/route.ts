import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.creatorId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await db.post.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      isPublic: body.isPublic,
      tierId: body.tierId || null,
      isPinned: body.isPinned,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.creatorId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
