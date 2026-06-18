"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon,
  XAIIcon, MistralIcon, DeepSeekIcon, FuelIcon,
} from "@/components/icons";
import { toast } from "sonner";

const PROVIDERS = [
  { id: "claude",      label: "Claude",      Icon: ClaudeIcon,      hint: "sk-ant-api03-...",      color: "border-orange-500 bg-orange-500/10 text-orange-400", note: "Charged to your Anthropic account" },
  { id: "openai",      label: "GPT / OpenAI", Icon: OpenAIIcon,     hint: "sk-proj-...",            color: "border-green-500 bg-green-500/10 text-green-400",  note: "Charged to your OpenAI account" },
  { id: "gemini",      label: "Gemini",       Icon: GeminiIcon,     hint: "AIza...",                color: "border-blue-500 bg-blue-500/10 text-blue-400",    note: "Charged to your Google AI account" },
  { id: "groq",        label: "Groq",         Icon: GroqIcon,       hint: "gsk_...",                color: "border-yellow-500 bg-yellow-500/10 text-yellow-400", note: "Charged to your Groq account" },
  { id: "xai",         label: "Grok / xAI",  Icon: XAIIcon,        hint: "xai-...",                color: "border-zinc-400 bg-zinc-400/10 text-zinc-300",    note: "Charged to your xAI account" },
  { id: "mistral",     label: "Mistral",      Icon: MistralIcon,    hint: "...",                    color: "border-rose-500 bg-rose-500/10 text-rose-400",    note: "Charged to your Mistral account" },
  { id: "deepseek",    label: "DeepSeek",     Icon: DeepSeekIcon,   hint: "sk-...",                 color: "border-sky-500 bg-sky-500/10 text-sky-400",       note: "Charged to your DeepSeek account" },
  { id: "openrouter",  label: "OpenRouter",   Icon: OpenRouterIcon, hint: "sk-or-v1-...",           color: "border-purple-500 bg-purple-500/10 text-purple-400", note: "Charged to your OpenRouter credits" },
];

const LIMITS = [
  { label: "5M tokens", value: 5 },
  { label: "10M tokens", value: 10 },
  { label: "50M tokens", value: 50 },
  { label: "100M tokens", value: 100 },
];

export default function SupportPage() {
  const params = useParams();
  const username = params.username as string;

  const [creatorName, setCreatorName] = useState(username);
  const [provider, setProvider] = useState("claude");
  const [apiKey, setApiKey] = useState("");
  const [tokenLimit, setTokenLimit] = useState(10);
  const [customLimit, setCustomLimit] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(r => r.json())
      .then(d => { if (d.name) setCreatorName(d.name); });
  }, [username]);

  const selectedProvider = PROVIDERS.find(p => p.id === provider)!;
  const finalLimit = customLimit ? parseFloat(customLimit) : tokenLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) { toast.error("Paste your API key"); return; }
    if (!finalLimit || finalLimit <= 0) { toast.error("Set a token limit"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/supporter-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername: username,
          provider,
          apiKey: apiKey.trim(),
          tokenLimit: finalLimit,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">You&apos;re supporting {creatorName}!</h1>
          <p className="text-zinc-400 text-sm mb-6">
            Your {selectedProvider.label} API key is now connected. {creatorName} can use up to{" "}
            <span className="text-orange-400 font-medium">{finalLimit}M tokens</span> from your account.
            You&apos;ll be billed directly by {selectedProvider.label} for actual usage.
          </p>
          <Button asChild>
            <Link href={`/@${username}`}>Back to @{username}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <Link href={`/@${username}`} className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 block">
          ← Back to @{username}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <FuelIcon className="w-6 h-6 text-orange-400" />
          <div>
            <h1 className="text-xl font-bold">Fuel {creatorName}</h1>
            <p className="text-sm text-zinc-500">Donate your AI tokens — they use your API key, you pay the bill</p>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 mb-6">
          <div className="text-xs font-semibold text-zinc-400 mb-3">How it works</div>
          <div className="space-y-2.5">
            {[
              ["1.", "Paste your API key below (Claude, OpenAI, etc.)"],
              ["2.", `Set a token limit — how many tokens ${creatorName} can use`],
              ["3.", "They use those tokens via GMT. Your API account gets billed for real usage."],
            ].map(([n, t]) => (
              <div key={n} className="flex gap-2.5 text-xs text-zinc-400">
                <span className="text-orange-400 font-bold flex-shrink-0">{n}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Provider */}
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">Your API provider</label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map(p => {
                const Icon = p.Icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${provider === p.id ? p.color + " ring-1 ring-current" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">
              Your {selectedProvider.label} API key
            </label>
            <p className="text-xs text-zinc-500 mb-2">{selectedProvider.note}</p>
            <Input
              type="password"
              placeholder={selectedProvider.hint}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Your key is encrypted and stored securely. It is never shown in plaintext again.
            </p>
          </div>

          {/* Token limit */}
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">Token limit (how much they can use)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {LIMITS.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => { setTokenLimit(l.value); setCustomLimit(""); }}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${tokenLimit === l.value && !customLimit ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Custom amount (M tokens)"
              value={customLimit}
              onChange={e => setCustomLimit(e.target.value)}
              min="1"
              step="1"
              className="text-sm"
            />
            {finalLimit > 0 && (
              <p className="text-xs text-zinc-500 mt-1.5">
                ≈ {finalLimit}M tokens · estimated cost varies by provider and models used
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-1">Note (optional)</label>
            <Input
              placeholder={`Leave ${creatorName} a message...`}
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={300}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Connecting key..." : `Donate ${finalLimit}M ${selectedProvider.label} tokens to ${creatorName}`}
          </Button>

          <p className="text-xs text-zinc-600 text-center">
            By submitting, you allow {creatorName} to use up to {finalLimit}M tokens from your {selectedProvider.label} account.
            Actual billing happens at {selectedProvider.label} — not through GiveMeSomeTokens.
          </p>
        </form>
      </div>
    </div>
  );
}
