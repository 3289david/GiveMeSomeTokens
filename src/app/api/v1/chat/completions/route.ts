import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { BALANCE_FIELD, KEY_FIELD } from "@/lib/utils";

function getProvider(model: string): string {
  if (model.startsWith("claude"))                                                return "claude";
  if (model.startsWith("gpt") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4")) return "openai";
  if (model.startsWith("gemini"))                                                return "gemini";
  if (model.startsWith("grok"))                                                  return "xai";
  if (model.startsWith("mistral") || model.startsWith("codestral") || model.startsWith("pixtral")) return "mistral";
  if (model.startsWith("deepseek"))                                              return "deepseek";
  if (model.startsWith("command") || model.startsWith("embed-"))                return "cohere";
  if (model.startsWith("llama-3") || model.startsWith("mixtral") || model.startsWith("gemma") || model.startsWith("qwen")) return "groq";
  if (model.startsWith("sonar") || model.startsWith("r1-"))                     return "perplexity";
  if (model.includes("together") || model.startsWith("meta-llama") || model.startsWith("Qwen")) return "together";
  if (model.startsWith("accounts/fireworks"))                                    return "fireworks";
  if (model.startsWith("llama3") && model.includes("cerebras"))                 return "cerebras";
  if (model.startsWith("jamba") || model.startsWith("j2-"))                     return "ai21";
  return "openrouter"; // catch-all
}

const PROVIDER_ENDPOINTS: Record<string, string> = {
  claude:     "https://api.anthropic.com/v1/messages",
  openai:     "https://api.openai.com/v1/chat/completions",
  gemini:     "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  groq:       "https://api.groq.com/openai/v1/chat/completions",
  xai:        "https://api.x.ai/v1/chat/completions",
  mistral:    "https://api.mistral.ai/v1/chat/completions",
  deepseek:   "https://api.deepseek.com/v1/chat/completions",
  cohere:     "https://api.cohere.ai/compatibility/v1/chat/completions",
  perplexity: "https://api.perplexity.ai/chat/completions",
  together:   "https://api.together.xyz/v1/chat/completions",
  fireworks:  "https://api.fireworks.ai/inference/v1/chat/completions",
  cerebras:   "https://api.cerebras.ai/v1/chat/completions",
  ai21:       "https://api.ai21.com/studio/v1/chat/completions",
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const gmtKey = authHeader?.replace("Bearer ", "").trim();
  if (!gmtKey?.startsWith("gmt_")) {
    return NextResponse.json(
      { error: { message: "Invalid API key. Use a GMT key (gmt_xxx).", type: "invalid_request_error" } },
      { status: 401 }
    );
  }

  const keyRecord = await db.gmtApiKey.findUnique({
    where: { key: gmtKey },
    include: { user: { include: { wallet: true } } },
  });

  if (!keyRecord) {
    return NextResponse.json(
      { error: { message: "API key not found.", type: "invalid_request_error" } },
      { status: 401 }
    );
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
    return NextResponse.json(
      { error: { message: "No wallet found. Connect API keys first.", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const keyEncField = KEY_FIELD[provider as keyof typeof KEY_FIELD];
  const keyEnc = keyEncField ? (wallet as Record<string, unknown>)[keyEncField] as string | null : null;
  if (!keyEnc) {
    return NextResponse.json(
      { error: { message: `No ${provider} API key connected. Visit /dashboard/providers.`, type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const balanceFieldName = BALANCE_FIELD[provider as keyof typeof BALANCE_FIELD];
  const balance = balanceFieldName ? (wallet as Record<string, unknown>)[balanceFieldName] as number : 0;
  if (balance <= 0) {
    return NextResponse.json(
      { error: { message: `Insufficient ${provider} token balance.`, type: "insufficient_quota" } },
      { status: 429 }
    );
  }

  let apiKey: string;
  try {
    apiKey = decrypt(keyEnc);
  } catch {
    return NextResponse.json({ error: { message: "Failed to decrypt API key.", type: "api_error" } }, { status: 500 });
  }

  const endpoint = PROVIDER_ENDPOINTS[provider] ?? PROVIDER_ENDPOINTS.openrouter;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let providerBody = { ...body };

  if (provider === "claude") {
    // Translate OpenAI messages format → Anthropic Messages API
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    const messages = body.messages ?? [];
    const systemMsg = messages.find((m: { role: string }) => m.role === "system");
    const otherMsgs = messages.filter((m: { role: string }) => m.role !== "system");
    providerBody = {
      model,
      max_tokens: body.max_tokens ?? 8096,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      messages: otherMsgs,
      stream: stream ?? false,
    };
  } else if (provider === "cohere") {
    // Cohere uses Bearer but their compat endpoint accepts standard OpenAI format
    headers["Authorization"] = `Bearer ${apiKey}`;
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(providerBody),
  });

  await db.gmtApiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } });

  if (stream) {
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "text/event-stream");
    responseHeaders.set("Cache-Control", "no-cache");
    responseHeaders.set("Connection", "keep-alive");
    await logUsage(keyRecord.id, keyRecord.userId, provider, model, 0.001, db);
    return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
  }

  const data = await response.json();

  let tokensUsed = 0.001;
  if (data.usage) {
    const total = (data.usage.total_tokens ?? 0) ||
                  ((data.usage.input_tokens ?? data.usage.prompt_tokens ?? 0) +
                   (data.usage.output_tokens ?? data.usage.completion_tokens ?? 0));
    if (total > 0) tokensUsed = total / 1_000_000;
  }

  if (response.ok) await logUsage(keyRecord.id, keyRecord.userId, provider, model, tokensUsed, db);

  return NextResponse.json(data, { status: response.status });
}

async function logUsage(keyId: string, userId: string, provider: string, model: string, tokensUsed: number, prisma: typeof db) {
  const field = BALANCE_FIELD[provider as keyof typeof BALANCE_FIELD];
  await Promise.all([
    prisma.apiUsageLog.create({ data: { keyId, provider, model, tokensUsed } }),
    prisma.gmtApiKey.update({ where: { id: keyId }, data: { totalTokensUsed: { increment: tokensUsed } } }),
    field ? prisma.wallet.update({ where: { userId }, data: { [field]: { decrement: tokensUsed } } }) : Promise.resolve(),
    prisma.aiUsageLog.create({ data: { userId, provider, model, tokensUsed, isPublic: false } }),
  ]);
}
