import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      website: true,
      github: true,
      twitter: true,
      image: true,
      isCreator: true,
      creatorTier: true,
      createdAt: true,
      projects: { select: { id: true, name: true, description: true } },
      goals: true,
      supportReceived: {
        where: { isPublic: true },
        include: {
          supporter: { select: { name: true, username: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Aggregate token totals
  const totals = await db.support.groupBy({
    by: ["provider"],
    where: { creatorId: user.id },
    _sum: { amount: true },
  });

  const tokenTotals: Record<string, number> = {};
  let grandTotal = 0;
  for (const t of totals) {
    tokenTotals[t.provider] = t._sum.amount ?? 0;
    grandTotal += t._sum.amount ?? 0;
  }

  return NextResponse.json({ ...user, tokenTotals, grandTotal });
}
