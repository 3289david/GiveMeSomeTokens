import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const BALANCE_FIELD: Record<string, string> = {
  claude: "claudeBalance",
  openai: "openaiBalance",
  gemini: "geminiBalance",
  openrouter: "openrouterBalance",
  groq: "groqBalance",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  const item = await db.marketplaceItem.findUnique({ where: { id: itemId } });
  if (!item || !item.published) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });

  const balanceField = BALANCE_FIELD[item.priceProvider];
  const balance = (wallet as Record<string, unknown>)[balanceField] as number;
  if (balance < item.price) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

  await db.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId: session.user.id },
      data: { [balanceField]: { decrement: item.price } },
    });
    await tx.wallet.upsert({
      where: { userId: item.creatorId },
      create: { userId: item.creatorId, [balanceField]: item.price },
      update: { [balanceField]: { increment: item.price } },
    });
    await tx.marketplacePurchase.create({
      data: { buyerId: session.user.id, itemId, provider: item.priceProvider, amount: item.price },
    });
  });

  return NextResponse.json({ ok: true, content: item.content });
}
