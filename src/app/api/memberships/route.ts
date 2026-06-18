import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  if (!creatorId) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const tiers = await db.membershipTier.findMany({
      where: { creatorId: session.user.id, active: true },
      orderBy: { position: "asc" },
    });
    return NextResponse.json(tiers);
  }
  const tiers = await db.membershipTier.findMany({
    where: { creatorId, active: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(tiers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;
  const body = await req.json();
  const { name, description, provider, monthlyAmount, perks, color, emoji } = body;
  if (!name?.trim() || !provider || !monthlyAmount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const count = await db.membershipTier.count({ where: { creatorId: userId } });
  const tier = await db.membershipTier.create({
    data: {
      creatorId: userId,
      name: name.trim(),
      description: description?.trim(),
      provider,
      monthlyAmount: parseFloat(monthlyAmount),
      perks: perks || [],
      color: color || "orange",
      emoji: emoji || "⭐",
      position: count,
    },
  });
  return NextResponse.json(tier);
}
