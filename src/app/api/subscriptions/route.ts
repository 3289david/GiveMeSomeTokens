import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BALANCE_FIELD, ALL_PROVIDERS } from "@/lib/utils";
import { z } from "zod";
import { addMonths } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [sent, received] = await Promise.all([
    db.subscription.findMany({
      where: { supporterId: session.user.id, active: true },
      include: { creator: { select: { name: true, username: true } } },
    }),
    db.subscription.findMany({
      where: { creatorId: session.user.id, active: true },
      include: { supporter: { select: { name: true, username: true } } },
    }),
  ]);
  return NextResponse.json({ sent, received });
}

const schema = z.object({
  creatorUsername: z.string(),
  provider: z.enum(ALL_PROVIDERS),
  amount: z.number().positive(),
  tier: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { creatorUsername, provider, amount, tier } = parsed.data;

  const creator = await db.user.findUnique({ where: { username: creatorUsername } });
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });

  const balanceField = BALANCE_FIELD[provider];
  const balance = (wallet as Record<string, unknown>)[balanceField] as number;
  if (balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId: session.user.id },
      data: { [balanceField]: { decrement: amount } },
    });
    await tx.wallet.upsert({
      where: { userId: creator.id },
      create: { userId: creator.id, [balanceField]: amount },
      update: { [balanceField]: { increment: amount } },
    });
    await tx.support.create({
      data: { supporterId: session.user.id, creatorId: creator.id, provider, amount, message: `Monthly subscription (${tier ?? "standard"})`, isPublic: true },
    });
    await tx.subscription.create({
      data: {
        supporterId: session.user.id,
        creatorId: creator.id,
        provider,
        amount,
        tier,
        lastBilledAt: now,
        nextBillAt: addMonths(now, 1),
      },
    });
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await db.subscription.updateMany({ where: { id, supporterId: session.user.id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
