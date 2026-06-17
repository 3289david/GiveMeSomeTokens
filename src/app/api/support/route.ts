import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BALANCE_FIELD, ALL_PROVIDERS } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  creatorUsername: z.string(),
  provider: z.enum(ALL_PROVIDERS),
  amount: z.number().positive(),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional(),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { creatorUsername, provider, amount, message, isAnonymous, projectId } = parsed.data;

  const creator = await db.user.findUnique({ where: { username: creatorUsername } });
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  if (creator.id === session.user.id) return NextResponse.json({ error: "Cannot support yourself" }, { status: 400 });

  const balanceField = BALANCE_FIELD[provider];

  // Check supporter wallet balance
  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet not found — connect API keys first" }, { status: 400 });

  const currentBalance = (wallet as Record<string, unknown>)[balanceField] as number;
  if (currentBalance < amount) {
    return NextResponse.json({ error: `Insufficient ${provider} balance. You have ${currentBalance}M tokens.` }, { status: 400 });
  }

  // Transaction: deduct from supporter, add to creator
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
      data: {
        supporterId: session.user.id,
        creatorId: creator.id,
        provider,
        amount,
        message,
        isAnonymous: isAnonymous ?? false,
        isPublic: true,
        projectId,
      },
    });

    // Update goal progress
    const goal = await tx.goal.findFirst({
      where: { creatorId: creator.id, provider, completed: false },
    });
    if (goal) {
      const newAmount = goal.currentAmount + amount;
      await tx.goal.update({
        where: { id: goal.id },
        data: {
          currentAmount: newAmount,
          completed: newAmount >= goal.targetAmount,
        },
      });
    }

    // Update creator tier
    const totalSupport = await tx.support.aggregate({
      where: { creatorId: creator.id },
      _sum: { amount: true },
    });
    const total = totalSupport._sum.amount ?? 0;
    let tier: string | null = null;
    if (total >= 100000) tier = "platinum";
    else if (total >= 10000) tier = "gold";
    else if (total >= 1000) tier = "silver";
    else if (total >= 100) tier = "bronze";
    await tx.user.update({ where: { id: creator.id }, data: { creatorTier: tier } });

    // Update supporter streak
    await tx.streak.upsert({
      where: { userId_type: { userId: session.user.id, type: "support" } },
      create: { userId: session.user.id, type: "support", count: 1, lastDate: new Date() },
      update: { count: { increment: 1 }, lastDate: new Date() },
    });
  });

  return NextResponse.json({ ok: true });
}
