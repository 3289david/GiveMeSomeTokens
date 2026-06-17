import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { z } from "zod";

const FIELD_MAP: Record<string, string> = {
  claude: "claudeKeyEnc",
  openai: "openaiKeyEnc",
  gemini: "geminiKeyEnc",
  openrouter: "openrouterKeyEnc",
  groq: "groqKeyEnc",
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) return NextResponse.json({});

  const result: Record<string, { connected: boolean; masked?: string }> = {};
  for (const [provider, field] of Object.entries(FIELD_MAP)) {
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
  provider: z.enum(["claude", "openai", "gemini", "openrouter", "groq"]),
  key: z.string().min(10),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { provider, key } = parsed.data;
  const field = FIELD_MAP[provider];
  const encrypted = encrypt(key);

  await db.wallet.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, [field]: encrypted },
    update: { [field]: encrypted },
  });

  return NextResponse.json({ ok: true });
}

const deleteSchema = z.object({ provider: z.enum(["claude", "openai", "gemini", "openrouter", "groq"]) });

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const field = FIELD_MAP[parsed.data.provider];
  await db.wallet.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: { [field]: null },
  });

  return NextResponse.json({ ok: true });
}
