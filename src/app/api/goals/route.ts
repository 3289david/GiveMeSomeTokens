import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await db.goal.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ goals });
}

const schema = z.object({
  provider: z.enum(["claude", "openai", "gemini", "openrouter", "groq"]),
  targetAmount: z.number().positive(),
  description: z.string().max(200).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const goal = await db.goal.create({
    data: { creatorId: session.user.id, ...parsed.data },
  });
  return NextResponse.json({ goal });
}
