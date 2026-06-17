import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { KEY_FIELD, ALL_PROVIDERS, type Provider } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) return NextResponse.json({});

  const result: Record<string, { connected: boolean; masked?: string }> = {};
  for (const provider of ALL_PROVIDERS) {
    const field = KEY_FIELD[provider];
    const enc = (wallet as Record<string, unknown>)[field] as string | null;
    if (enc) {
      try {
        const raw = decrypt(enc);
        result[provider] = { connected: true, masked: raw.slice(0, 8) + "..." + raw.slice(-4) };
      } catch {
        result[provider] = { connected: true, masked: "****" };
      }
    } else {
      result[provider] = { connected: false };
    }
  }
  return NextResponse.json(result);
}

const saveSchema = z.object({
  provider: z.enum(ALL_PROVIDERS),
  key: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { provider, key } = parsed.data;
  const field = KEY_FIELD[provider];
  const encrypted = encrypt(key);

  await db.wallet.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, [field]: encrypted },
    update: { [field]: encrypted },
  });

  return NextResponse.json({ ok: true });
}

const deleteSchema = z.object({ provider: z.enum(ALL_PROVIDERS) });

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const field = KEY_FIELD[parsed.data.provider];
  await db.wallet.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: { [field]: null },
  });

  return NextResponse.json({ ok: true });
}
