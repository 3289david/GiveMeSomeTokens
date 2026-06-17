import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

// Model to provider mapping
function getProvider(model: string): string {
  if (model.startsWith("claude")) return "claude";
  if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4")) return "openai";
  if (model.startsWith("gemini")) return "gemini";
  if (model.startsWith("llama") || model.startsWith("mixtral") || model.startsWith("gemma") || model.startsWith("qwen")) return "groq";
  // Default to openrouter for unknown models
  return "openrouter";
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  claude: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
};

const BALANCE_FIELD: Record<string, string> = {
  claude: "claudeBalance",
  openai: "openaiBalance",
  gemini: "geminiBalance",
  openrouter: "openrouterBalance",
  groq: "groqBalance",
};

const KEY_FIELD: Record<string, string> = {
  claude: "claudeKeyEnc",
  openai: "openaiKeyEnc",
  gemini: "geminiKeyEnc",
  openrouter: "openrouterKeyEnc",
  groq: "groqKeyEnc",
};

export async function POST(req: NextRequest) {
  // Validate GMT API key
  const authHeader = req.headers.get("authorization");
  const gmtKey = authHeader?.replace("Bearer ", "").trim();
  if (!gmtKey?.startsWith("gmt_")) {
    return NextResponse.json({ error: { message: "Invalid API key. Use a GMT key (gmt_xxx).", type: "invalid_request_error" } }, { status: 401 });
  }

  const keyRecord = await db.gmtApiKey.findUnique({
    where: { key: gmtKey },
    include: { user: { include: { wallet: true } } },
  });

  if (!keyRecord) {
    return NextResponse.json({ error: { message: "API key not found.", type: "invalid_request_error" } }, { status: 401 });
  }

  const body = await req.json();
  const model = body.model as string;
  const stream = body.stream as boolean | undefined;

  if (!model) {
    return NextResponse.json({ error: { message: "model is required", type: "invalid_request_error" } }, { status: 400 });
  }

  const provider = getProvider(model);
  const wallet = keyRecord.user.wallet;

  if (!wallet) {
    return NextResponse.json({ error: { message: "No wallet found. Connect API keys first.", type: "invalid_request_error" } }, { status: 400 });
  }

  const keyEnc = (wallet as Record<string, unknown>)[KEY_FIELD[provider]] as string | null;
  if (!keyEnc) {
    return NextResponse.json({ error: { message: `No ${provider} API key connected. Visit /dashboard/providers.`, type: "invalid_request_error" } }, { status: 400 });
  }

  const balanceField = BALANCE_FIELD[provider];
  const balance = (wallet as Record<string, unknown>)[balanceField] as number;
  if (balance <= 0) {
    return NextResponse.json({ error: { message: `Insufficient ${provider} token balance.`, type: "insufficient_quota" } }, { status: 429 });
  }

  let apiKey: string;
  try {
    apiKey = decrypt(keyEnc);
  } catch {
    return NextResponse.json({ error: { message: "Failed to decrypt API key.", type: "api_error" } }, { status: 500 });
  }

  const endpoint = PROVIDER_ENDPOINTS[provider];

  // Build provider-specific headers and body
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let providerBody = body;

  if (provider === "claude") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    // Translate OpenAI format to Anthropic format
    const messages = body.messages ?? [];
    const systemMsg = messages.find((m: { role: string }) => m.role === "system");
    const otherMsgs = messages.filter((m: { role: string }) => m.role !== "system");
    providerBody = {
      model,
      max_tokens: body.max_tokens ?? 8096,
      system: systemMsg?.content,
      messages: otherMsgs,
      stream: stream ?? false,
    };
    if (!systemMsg) delete providerBody.system;
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // Forward request
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(providerBody),
  });

  // Update key last used and deduct tokens (estimate based on usage in response)
  await db.gmtApiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  if (stream) {
    // Stream the response back
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "text/event-stream");
    responseHeaders.set("Cache-Control", "no-cache");
    responseHeaders.set("Connection", "keep-alive");

    // Log approximate usage (we'll estimate 1K tokens for streaming since we can't know ahead of time)
    const estimatedTokens = 0.001; // 1K tokens
    await logUsage(keyRecord.id, keyRecord.userId, provider, model, estimatedTokens, db);

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  }

  const data = await response.json();

  // Calculate actual token usage if available
  let tokensUsed = 0;
  if (data.usage) {
    const totalTokens = (data.usage.total_tokens ?? data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0);
    tokensUsed = totalTokens / 1_000_000; // Convert to millions
  } else {
    tokensUsed = 0.001; // 1K estimate
  }

  if (tokensUsed > 0 && response.ok) {
    await logUsage(keyRecord.id, keyRecord.userId, provider, model, tokensUsed, db);
  }

  return NextResponse.json(data, { status: response.status });
}

async function logUsage(keyId: string, userId: string, provider: string, model: string, tokensUsed: number, prisma: typeof db) {
  const balanceField: Record<string, string> = {
    claude: "claudeBalance",
    openai: "openaiBalance",
    gemini: "geminiBalance",
    openrouter: "openrouterBalance",
    groq: "groqBalance",
  };
  await Promise.all([
    prisma.apiUsageLog.create({ data: { keyId, provider, model, tokensUsed } }),
    prisma.gmtApiKey.update({ where: { id: keyId }, data: { totalTokensUsed: { increment: tokensUsed } } }),
    prisma.wallet.update({ where: { userId }, data: { [balanceField[provider]]: { decrement: tokensUsed } } }),
    prisma.aiUsageLog.create({ data: { userId, provider, model, tokensUsed, isPublic: false } }),
  ]);
}
