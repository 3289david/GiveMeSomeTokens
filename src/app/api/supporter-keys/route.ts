import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const schema = z.object({
  creatorUsername: z.string(),
  provider: z.string(),
  apiKey: z.string().min(8),
  tokenLimit: z.number().min(0).default(0),
  note: z.string().max(300).optional(),
  isAnonymous: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { creatorUsername, provider, apiKey, tokenLimit, note, isAnonymous } = parsed.data;

  const creator = await db.user.findUnique({ where: { username: creatorUsername } });
  if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  if (session?.user?.id && creator.id === session.user.id) {
    return NextResponse.json({ error: "You cannot support yourself" }, { status: 400 });
  }

  const keyEnc = encrypt(apiKey);
  const keyHint = apiKey.slice(-4);

  const supporterKey = await db.supporterKey.create({
    data: {
      supporterId: (!isAnonymous && session?.user?.id) ? session.user.id : null,
      creatorId: creator.id,
      provider,
      keyEnc,
      keyHint,
      tokenLimit,
      note,
      active: true,
    },
  });

  // Only create a Support record if we have a real supporter ID
  if (session?.user?.id && !isAnonymous) {
    await db.support.create({
      data: {
        supporterId: session.user.id,
        creatorId: creator.id,
        provider,
        amount: tokenLimit > 0 ? tokenLimit : 100,
        message: note,
        isAnonymous: false,
        isPublic: true,
      },
    });
  }

  return NextResponse.json({ ok: true, id: supporterKey.id });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view"); // "given" or "received"

  if (view === "given") {
    const keys = await db.supporterKey.findMany({
      where: { supporterId: session.user.id },
      include: { creator: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ keys });
  }

  // Default: received (creator view)
  const keys = await db.supporterKey.findMany({
    where: { creatorId: session.user.id },
    include: { supporter: { select: { name: true, username: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ keys });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  // Allow creator or supporter to deactivate
  const key = await db.supporterKey.findFirst({
    where: {
      id,
      OR: [{ creatorId: session.user.id }, { supporterId: session.user.id }],
    },
  });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.supporterKey.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
