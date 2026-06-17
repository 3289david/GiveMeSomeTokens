"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const INTEGRATIONS = [
  { name: "Cursor", id: "cursor", icon: "⬛", desc: "AI-powered code editor", setup: [
    "Go to Cursor Settings > Models",
    "Set API Base URL to: https://givemesometokens.dev/api/v1",
    "Paste your GMT key as the API key",
    "Select any model (gpt-4o, claude-3-5-sonnet, etc.)",
  ]},
  { name: "Cline", id: "cline", icon: "🤖", desc: "VS Code AI coding assistant", setup: [
    "Open Cline extension settings",
    "Set API Provider to \"OpenAI Compatible\"",
    "Set Base URL to: https://givemesometokens.dev/api/v1",
    "Paste your GMT key",
  ]},
  { name: "Continue", id: "continue", icon: "▶", desc: "Open source AI code assistant", setup: [
    "Open ~/.continue/config.json",
    "Add provider: { \"provider\": \"openai\", \"apiBase\": \"https://givemesometokens.dev/api/v1\", \"apiKey\": \"YOUR_GMT_KEY\" }",
  ]},
  { name: "Roo Code", id: "roo", icon: "🦘", desc: "VS Code AI assistant", setup: [
    "Open Roo Code settings",
    "Select \"OpenAI Compatible\" as provider",
    "Base URL: https://givemesometokens.dev/api/v1",
    "API key: your GMT key",
  ]},
  { name: "Aider", id: "aider", icon: "✏", desc: "AI pair programming in terminal", setup: [
    "Run: aider --openai-api-base https://givemesometokens.dev/api/v1 --openai-api-key YOUR_GMT_KEY",
    "Or set env vars: OPENAI_API_BASE and OPENAI_API_KEY",
  ]},
  { name: "OpenCode", id: "opencode", icon: "⚡", desc: "Terminal AI coding agent", setup: [
    "Set OPENAI_BASE_URL=https://givemesometokens.dev/api/v1",
    "Set OPENAI_API_KEY=your GMT key",
  ]},
];

export default function IntegrationsPage() {
  const [gmtKey, setGmtKey] = useState("");

  useEffect(() => {
    fetch("/api/keys").then(r => r.json()).then(d => {
      if (d.keys?.length > 0) setGmtKey(d.keys[0].key);
    });
  }, []);

  const genKey = async () => {
    const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Integration" }) });
    const d = await res.json();
    if (d.key) { setGmtKey(d.key); toast.success("GMT key generated"); }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Integrations</h1>
      <p className="text-zinc-500 text-sm mb-8">Use your GMT key with any OpenAI-compatible tool. One key, all providers.</p>

      <Card className="mb-8 border-orange-500/30">
        <CardHeader><CardTitle className="text-sm">Your GMT API Key</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-zinc-500">This key routes to your connected providers (Claude, GPT, Gemini, etc.) based on the model you request.</p>
          {gmtKey ? (
            <div className="flex gap-2">
              <Input value={gmtKey} readOnly className="font-mono text-xs" />
              <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(gmtKey); toast.success("Copied!"); }}>Copy</Button>
            </div>
          ) : (
            <Button size="sm" onClick={genKey}>Generate GMT Key</Button>
          )}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-lg bg-zinc-800 px-3 py-2">
              <div className="text-xs text-zinc-500">Base URL</div>
              <div className="text-xs font-mono text-zinc-300 mt-0.5">https://givemesometokens.dev/api/v1</div>
            </div>
            <div className="rounded-lg bg-zinc-800 px-3 py-2">
              <div className="text-xs text-zinc-500">Compatible with</div>
              <div className="text-xs text-zinc-300 mt-0.5">OpenAI API v1</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map(({ name, id, desc, setup }) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle className="text-sm">{name}</CardTitle>
              <p className="text-xs text-zinc-500">{desc}</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {setup.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-zinc-400">
                    <span className="text-orange-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
