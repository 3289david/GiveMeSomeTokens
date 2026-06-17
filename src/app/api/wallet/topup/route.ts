import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BALANCE_FIELD, ALL_PROVIDERS } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(ALL_PROVIDERS),
  amount: z.number().positive().max(10000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { provider, amount } = parsed.data;
  const field = BALANCE_FIELD[provider];

  await db.wallet.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, [field]: amount },
    update: { [field]: { increment: amount } },
  });

  return NextResponse.json({ ok: true });
}
