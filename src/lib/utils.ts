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
    case "claude":      return "text-orange-400";
    case "openai":      return "text-green-400";
    case "gemini":      return "text-blue-400";
    case "openrouter":  return "text-purple-400";
    case "groq":        return "text-yellow-400";
    case "xai":         return "text-zinc-200";
    case "mistral":     return "text-rose-400";
    case "deepseek":    return "text-sky-400";
    case "cohere":      return "text-teal-400";
    case "perplexity":  return "text-indigo-400";
    case "together":    return "text-pink-400";
    case "fireworks":   return "text-amber-400";
    case "cerebras":    return "text-red-400";
    case "ai21":        return "text-cyan-400";
    default:            return "text-zinc-400";
  }
}

export function providerLabel(provider: string): string {
  switch (provider) {
    case "claude":      return "Claude";
    case "openai":      return "GPT";
    case "gemini":      return "Gemini";
    case "openrouter":  return "OpenRouter";
    case "groq":        return "Groq";
    case "xai":         return "Grok";
    case "mistral":     return "Mistral";
    case "deepseek":    return "DeepSeek";
    case "cohere":      return "Cohere";
    case "perplexity":  return "Perplexity";
    case "together":    return "Together AI";
    case "fireworks":   return "Fireworks";
    case "cerebras":    return "Cerebras";
    case "ai21":        return "AI21";
    default:            return provider;
  }
}

export function providerBg(provider: string): string {
  switch (provider) {
    case "claude":      return "bg-orange-500/20";
    case "openai":      return "bg-green-500/20";
    case "gemini":      return "bg-blue-500/20";
    case "openrouter":  return "bg-purple-500/20";
    case "groq":        return "bg-yellow-500/20";
    case "xai":         return "bg-zinc-500/20";
    case "mistral":     return "bg-rose-500/20";
    case "deepseek":    return "bg-sky-500/20";
    case "cohere":      return "bg-teal-500/20";
    case "perplexity":  return "bg-indigo-500/20";
    case "together":    return "bg-pink-500/20";
    case "fireworks":   return "bg-amber-500/20";
    case "cerebras":    return "bg-red-500/20";
    case "ai21":        return "bg-cyan-500/20";
    default:            return "bg-zinc-500/20";
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

// All supported provider keys — single source of truth
export const ALL_PROVIDERS = [
  "claude", "openai", "gemini", "openrouter", "groq",
  "xai", "mistral", "deepseek", "cohere", "perplexity",
  "together", "fireworks", "cerebras", "ai21",
] as const;

export type Provider = typeof ALL_PROVIDERS[number];

export const BALANCE_FIELD: Record<Provider, string> = {
  claude:     "claudeBalance",
  openai:     "openaiBalance",
  gemini:     "geminiBalance",
  openrouter: "openrouterBalance",
  groq:       "groqBalance",
  xai:        "xaiBalance",
  mistral:    "mistralBalance",
  deepseek:   "deepseekBalance",
  cohere:     "cohereBalance",
  perplexity: "perplexityBalance",
  together:   "togetherBalance",
  fireworks:  "fireworksBalance",
  cerebras:   "cerebrasBalance",
  ai21:       "ai21Balance",
};

export const KEY_FIELD: Record<Provider, string> = {
  claude:     "claudeKeyEnc",
  openai:     "openaiKeyEnc",
  gemini:     "geminiKeyEnc",
  openrouter: "openrouterKeyEnc",
  groq:       "groqKeyEnc",
  xai:        "xaiKeyEnc",
  mistral:    "mistralKeyEnc",
  deepseek:   "deepseekKeyEnc",
  cohere:     "cohereKeyEnc",
  perplexity: "perplexityKeyEnc",
  together:   "togetherKeyEnc",
  fireworks:  "fireworksKeyEnc",
  cerebras:   "cerebrasKeyEnc",
  ai21:       "ai21KeyEnc",
};
