import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const items = await db.marketplaceItem.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ items });
}

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["Prompt Pack", "Agent", "Workflow", "MCP Server", "Template"]),
  price: z.number().positive(),
  priceProvider: z.enum(["claude", "openai", "gemini", "openrouter", "groq"]),
  content: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const item = await db.marketplaceItem.create({
    data: { creatorId: session.user.id, ...parsed.data, published: true },
  });
  return NextResponse.json({ item });
}
