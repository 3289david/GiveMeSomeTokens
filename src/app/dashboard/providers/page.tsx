"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon } from "@/components/icons";

const PROVIDERS = [
  { key: "claude", label: "Claude (Anthropic)", Icon: ClaudeIcon, placeholder: "sk-ant-api03-...", docs: "https://console.anthropic.com/account/keys" },
  { key: "openai", label: "OpenAI (GPT)", Icon: OpenAIIcon, placeholder: "sk-proj-...", docs: "https://platform.openai.com/api-keys" },
  { key: "gemini", label: "Gemini (Google)", Icon: GeminiIcon, placeholder: "AIza...", docs: "https://aistudio.google.com/app/apikey" },
  { key: "openrouter", label: "OpenRouter", Icon: OpenRouterIcon, placeholder: "sk-or-v1-...", docs: "https://openrouter.ai/keys" },
  { key: "groq", label: "Groq", Icon: GroqIcon, placeholder: "gsk_...", docs: "https://console.groq.com/keys" },
];

export default function ProvidersPage() {
  const [keys, setKeys] = useState<Record<string, { connected: boolean; masked?: string }>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/providers").then(r => r.json()).then(setKeys);
  }, []);

  const save = async (provider: string) => {
    const key = inputs[provider];
    if (!key?.trim()) return;
    setLoading(l => ({ ...l, [provider]: true }));
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key: key.trim() }),
      });
      if (res.ok) {
        toast.success(`${provider} key saved`);
        setKeys(k => ({ ...k, [provider]: { connected: true, masked: key.slice(0, 8) + "..." } }));
        setInputs(i => ({ ...i, [provider]: "" }));
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to save key");
      }
    } finally {
      setLoading(l => ({ ...l, [provider]: false }));
    }
  };

  const remove = async (provider: string) => {
    setLoading(l => ({ ...l, [provider]: true }));
    try {
      const res = await fetch("/api/providers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        toast.success(`${provider} key removed`);
        setKeys(k => ({ ...k, [provider]: { connected: false } }));
      }
    } finally {
      setLoading(l => ({ ...l, [provider]: false }));
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-zinc-500 text-sm mb-8">
        Connect your AI provider keys. They are stored AES-256-GCM encrypted. Creators who support you use tokens from your wallet — your key stays on our servers and is never exposed.
      </p>

      <div className="space-y-4">
        {PROVIDERS.map(({ key, label, Icon, placeholder, docs }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className="w-5 h-5" />
                {label}
                {keys[key]?.connected && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Connected</span>
                )}
              </CardTitle>
              {keys[key]?.connected && keys[key].masked && (
                <CardDescription>{keys[key].masked}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {keys[key]?.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => remove(key)}
                  disabled={loading[key]}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  {loading[key] ? "Removing..." : "Remove key"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder={placeholder}
                    value={inputs[key] ?? ""}
                    onChange={(e) => setInputs(i => ({ ...i, [key]: e.target.value }))}
                    type="password"
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => save(key)}
                    disabled={loading[key] || !inputs[key]}
                  >
                    {loading[key] ? "Saving..." : "Save"}
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a href={docs} target="_blank" rel="noopener noreferrer">Get key</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="text-sm font-semibold mb-1">Your GMT API Key</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Use this key in any OpenAI-compatible tool (Cursor, Cline, Continue, etc.). It routes through your connected providers.
        </p>
        <GmtKeySection />
      </div>
    </div>
  );
}

function GmtKeySection() {
  const [key, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/keys").then(r => r.json()).then(d => {
      if (d.keys?.length > 0) setKey(d.keys[0].key);
    });
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Default" }) });
      const d = await res.json();
      if (d.key) setKey(d.key);
    } finally {
      setLoading(false);
    }
  };

  return key ? (
    <div className="flex gap-2">
      <Input value={key} readOnly className="font-mono text-xs" onClick={(e) => (e.target as HTMLInputElement).select()} />
      <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(key); toast.success("Copied!"); }}>Copy</Button>
    </div>
  ) : (
    <Button size="sm" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate GMT Key"}</Button>
  );
}
