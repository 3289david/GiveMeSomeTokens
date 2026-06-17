import { NextResponse } from "next/server";

const MODELS = [
  // Anthropic Claude
  { id: "claude-opus-4-8", owned_by: "anthropic" },
  { id: "claude-sonnet-4-6", owned_by: "anthropic" },
  { id: "claude-haiku-4-5-20251001", owned_by: "anthropic" },
  // OpenAI
  { id: "gpt-4o", owned_by: "openai" },
  { id: "gpt-4o-mini", owned_by: "openai" },
  { id: "gpt-4.1", owned_by: "openai" },
  { id: "gpt-4.1-mini", owned_by: "openai" },
  { id: "o4-mini", owned_by: "openai" },
  { id: "o3", owned_by: "openai" },
  // Google Gemini
  { id: "gemini-2.5-pro", owned_by: "google" },
  { id: "gemini-2.5-flash", owned_by: "google" },
  { id: "gemini-2.0-flash", owned_by: "google" },
  // xAI Grok
  { id: "grok-3", owned_by: "xai" },
  { id: "grok-3-mini", owned_by: "xai" },
  { id: "grok-2", owned_by: "xai" },
  // Mistral
  { id: "mistral-large-latest", owned_by: "mistral" },
  { id: "mistral-small-latest", owned_by: "mistral" },
  { id: "codestral-latest", owned_by: "mistral" },
  { id: "pixtral-large-latest", owned_by: "mistral" },
  // DeepSeek
  { id: "deepseek-chat", owned_by: "deepseek" },
  { id: "deepseek-reasoner", owned_by: "deepseek" },
  { id: "deepseek-coder", owned_by: "deepseek" },
  // Cohere
  { id: "command-r-plus", owned_by: "cohere" },
  { id: "command-r", owned_by: "cohere" },
  { id: "command-a-03-2025", owned_by: "cohere" },
  // Perplexity
  { id: "sonar-pro", owned_by: "perplexity" },
  { id: "sonar", owned_by: "perplexity" },
  { id: "sonar-reasoning", owned_by: "perplexity" },
  // Together AI
  { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", owned_by: "together" },
  { id: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", owned_by: "together" },
  { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", owned_by: "together" },
  // Fireworks
  { id: "accounts/fireworks/models/llama-v3p1-405b-instruct", owned_by: "fireworks" },
  { id: "accounts/fireworks/models/llama-v3p3-70b-instruct", owned_by: "fireworks" },
  { id: "accounts/fireworks/models/qwen2p5-72b-instruct", owned_by: "fireworks" },
  // Groq
  { id: "llama-3.3-70b-versatile", owned_by: "groq" },
  { id: "llama-3.1-8b-instant", owned_by: "groq" },
  { id: "mixtral-8x7b-32768", owned_by: "groq" },
  { id: "gemma2-9b-it", owned_by: "groq" },
  { id: "deepseek-r1-distill-llama-70b", owned_by: "groq" },
  // Cerebras
  { id: "llama3.1-70b-cerebras", owned_by: "cerebras" },
  { id: "llama3.1-8b-cerebras", owned_by: "cerebras" },
  // AI21
  { id: "jamba-1.6-large", owned_by: "ai21" },
  { id: "jamba-1.6-mini", owned_by: "ai21" },
  // OpenRouter (catch-all)
  { id: "openrouter/auto", owned_by: "openrouter" },
];

const ts = Math.floor(Date.now() / 1000);

export async function GET() {
  return NextResponse.json({
    object: "list",
    data: MODELS.map((m) => ({ object: "model", created: ts, ...m })),
  });
}
