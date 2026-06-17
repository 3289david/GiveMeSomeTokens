import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTokens(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}B`;
  if (amount >= 1) return `${amount.toFixed(1)}M`;
  return `${(amount * 1000).toFixed(0)}K`;
}

export function providerColor(provider: string): string {
  switch (provider) {
    case "claude": return "text-orange-400";
    case "openai": return "text-green-400";
    case "gemini": return "text-blue-400";
    case "openrouter": return "text-purple-400";
    case "groq": return "text-yellow-400";
    default: return "text-zinc-400";
  }
}

export function providerLabel(provider: string): string {
  switch (provider) {
    case "claude": return "Claude";
    case "openai": return "GPT";
    case "gemini": return "Gemini";
    case "openrouter": return "OpenRouter";
    case "groq": return "Groq";
    default: return provider;
  }
}

export function generateGmtKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "gmt_";
  for (let i = 0; i < 48; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}
