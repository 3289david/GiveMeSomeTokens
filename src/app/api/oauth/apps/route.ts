import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await db.oAuthApp.findMany({
    where: { creatorId: session.user.id },
    select: { id: true, name: true, clientId: true, redirectUris: true, scopes: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ apps });
}

const schema = z.object({
  name: z.string().min(1).max(100),
  redirectUris: z.array(z.string().url()).min(1),
  scopes: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const clientSecret = randomBytes(32).toString("hex");
  const clientSecretHash = createHash("sha256").update(clientSecret).digest("hex");

  const app = await db.oAuthApp.create({
    data: {
      creatorId: session.user.id,
      ...parsed.data,
      clientSecretHash,
    },
  });

  return NextResponse.json({
    id: app.id,
    clientId: app.clientId,
    clientSecret, // Only shown once
  });
}
