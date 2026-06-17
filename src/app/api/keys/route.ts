import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateGmtKey } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db.gmtApiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, key: true, totalTokensUsed: true, lastUsedAt: true, createdAt: true },
  });
  return NextResponse.json({ keys });
}

const createSchema = z.object({ name: z.string().min(1).max(64) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const key = generateGmtKey();
  const record = await db.gmtApiKey.create({
    data: { userId: session.user.id, name: parsed.data.name, key },
  });
  return NextResponse.json({ key: record.key, id: record.id });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await db.gmtApiKey.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
