import { NextResponse } from "next/server";

const MODELS = [
  // Claude
  { id: "claude-opus-4-8", owned_by: "anthropic", created: 1699000000 },
  { id: "claude-sonnet-4-6", owned_by: "anthropic", created: 1699000000 },
  { id: "claude-haiku-4-5-20251001", owned_by: "anthropic", created: 1699000000 },
  // OpenAI
  { id: "gpt-4o", owned_by: "openai", created: 1699000000 },
  { id: "gpt-4o-mini", owned_by: "openai", created: 1699000000 },
  { id: "gpt-4.1", owned_by: "openai", created: 1699000000 },
  { id: "o4-mini", owned_by: "openai", created: 1699000000 },
  // Gemini
  { id: "gemini-2.0-flash", owned_by: "google", created: 1699000000 },
  { id: "gemini-2.5-pro", owned_by: "google", created: 1699000000 },
  { id: "gemini-2.5-flash", owned_by: "google", created: 1699000000 },
  // Groq
  { id: "llama-3.3-70b-versatile", owned_by: "meta", created: 1699000000 },
  { id: "mixtral-8x7b-32768", owned_by: "mistral", created: 1699000000 },
];

export async function GET() {
  return NextResponse.json({
    object: "list",
    data: MODELS.map(m => ({ object: "model", ...m })),
  });
}
