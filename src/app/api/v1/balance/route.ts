import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatTokens } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const gmtKey = authHeader?.replace("Bearer ", "").trim();

  if (!gmtKey?.startsWith("gmt_")) {
    return NextResponse.json({ error: "Invalid GMT key" }, { status: 401 });
  }

  const keyRecord = await db.gmtApiKey.findUnique({
    where: { key: gmtKey },
    include: { user: { include: { wallet: true } } },
  });

  if (!keyRecord) return NextResponse.json({ error: "Key not found" }, { status: 401 });

  const wallet = keyRecord.user.wallet;
  if (!wallet) return NextResponse.json({ claude: "0", openai: "0", gemini: "0", openrouter: "0", groq: "0" });

  return NextResponse.json({
    claude: `${wallet.claudeBalance}M`,
    openai: `${wallet.openaiBalance}M`,
    gemini: `${wallet.geminiBalance}M`,
    openrouter: `${wallet.openrouterBalance}M`,
    groq: `${wallet.groqBalance}M`,
    formatted: {
      claude: formatTokens(wallet.claudeBalance),
      openai: formatTokens(wallet.openaiBalance),
      gemini: formatTokens(wallet.geminiBalance),
      openrouter: formatTokens(wallet.openrouterBalance),
      groq: formatTokens(wallet.groqBalance),
    },
  });
}
