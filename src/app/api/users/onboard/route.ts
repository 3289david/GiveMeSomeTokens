import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(2).max(32).regex(/^[a-z0-9_-]+$/),
  isCreator: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { username, isCreator } = parsed.data;

  const existing = await db.user.findUnique({ where: { username } });
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { username, isCreator },
  });

  // Create wallet if not exists
  await db.wallet.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
