import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, website: true, github: true, twitter: true, username: true },
  });
  return NextResponse.json({ user });
}

const schema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  github: z.string().max(50).optional(),
  twitter: z.string().max(50).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await db.user.update({ where: { id: session.user.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
