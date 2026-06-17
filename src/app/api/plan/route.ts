import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, planExpiresAt: true },
  });
  return NextResponse.json({ plan: user?.plan ?? "free", planExpiresAt: user?.planExpiresAt });
}

// Demo upgrade endpoint — in production this would integrate with Stripe
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const { plan } = await req.json();
  if (!["free", "pro", "team"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planExpiresAt = plan === "free" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.user.update({
    where: { id: userId },
    data: { plan, planExpiresAt },
  });
  return NextResponse.json({ ok: true, plan });
}
