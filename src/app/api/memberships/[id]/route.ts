import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tier = await db.membershipTier.findUnique({ where: { id } });
  if (!tier || tier.creatorId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = await db.membershipTier.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      provider: body.provider,
      monthlyAmount: body.monthlyAmount,
      perks: body.perks,
      color: body.color,
      emoji: body.emoji,
      active: body.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const tier = await db.membershipTier.findUnique({ where: { id } });
  if (!tier || tier.creatorId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.membershipTier.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
