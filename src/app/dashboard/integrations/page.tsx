"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const INTEGRATIONS = [
  { name: "Cursor", id: "cursor", icon: "⬛", desc: "AI-powered code editor", setup: [
    "Go to Cursor Settings → Models → OpenAI API Key",
    "Set Override OpenAI Base URL to: https://givemesometokens.dev/api/v1",
    "Paste your GMT key as the API key and save",
    "Select any model: gpt-4o, claude-3-5-sonnet, gemini-2.0-flash, etc.",
  ]},
  { name: "Cline", id: "cline", icon: "🤖", desc: "VS Code AI coding assistant", setup: [
    "Open Cline extension settings in VS Code",
    "Set API Provider to \"OpenAI Compatible\"",
    "Set Base URL to: https://givemesometokens.dev/api/v1",
    "Paste your GMT key as the API key",
  ]},
  { name: "Continue", id: "continue", icon: "▶", desc: "Open source AI code assistant", setup: [
    'Open ~/.continue/config.json (or config.yaml)',
    'Add: { "provider": "openai", "apiBase": "https://givemesometokens.dev/api/v1", "apiKey": "YOUR_GMT_KEY" }',
    "Pick any model name from our supported list",
  ]},
  { name: "Roo Code", id: "roo", icon: "🦘", desc: "VS Code AI assistant", setup: [
    "Open Roo Code settings panel",
    "Select \"OpenAI Compatible\" as provider",
    "Base URL: https://givemesometokens.dev/api/v1",
    "API key: your GMT key",
  ]},
  { name: "Aider", id: "aider", icon: "✏", desc: "AI pair programming in terminal", setup: [
    "Run: OPENAI_API_BASE=https://givemesometokens.dev/api/v1 OPENAI_API_KEY=YOUR_GMT_KEY aider",
    "Or: aider --openai-api-base https://givemesometokens.dev/api/v1 --openai-api-key YOUR_GMT_KEY",
  ]},
  { name: "OpenCode", id: "opencode", icon: "⚡", desc: "Terminal AI coding agent", setup: [
    "export OPENAI_BASE_URL=https://givemesometokens.dev/api/v1",
    "export OPENAI_API_KEY=your_gmt_key",
    "Then run opencode as normal",
  ]},
  { name: "Python / Node SDK", id: "sdk", icon: "🐍", desc: "Any code using OpenAI SDK", setup: [
    "Python: client = OpenAI(base_url='https://givemesometokens.dev/api/v1', api_key='YOUR_GMT_KEY')",
    "Node: new OpenAI({ baseURL: 'https://givemesometokens.dev/api/v1', apiKey: 'YOUR_GMT_KEY' })",
    "All models available: claude-3-5-sonnet-20241022, gpt-4o, gemini-2.0-flash, etc.",
  ]},
  { name: "Any OpenAI-compatible app", id: "other", icon: "🔌", desc: "Any app that accepts a custom base URL", setup: [
    "Base URL: https://givemesometokens.dev/api/v1",
    "API Key: your GMT key",
    "Works with any tool that supports OpenAI API v1",
  ]},
];

export default function IntegrationsPage() {
  const [gmtKey, setGmtKey] = useState("");
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"widget" | "tools">("widget");

  useEffect(() => {
    fetch("/api/keys").then(r => r.json()).then(d => {
      if (d.keys?.length > 0) setGmtKey(d.keys[0].key);
    });
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.user?.username) setUsername(d.user.username);
    });
  }, []);

  const genKey = async () => {
    const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Integration" }) });
    const d = await res.json();
    if (d.key) { setGmtKey(d.key); toast.success("GMT key generated"); }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const profileUrl = username ? `https://givemesometokens.dev/@${username}` : "https://givemesometokens.dev/@your-username";
  const supportUrl = username ? `https://givemesometokens.dev/@${username}/support` : "https://givemesometokens.dev/@your-username/support";

  const buttonWidget = `<!-- Support me with AI tokens (Button) -->
<a href="${supportUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#f97316;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;">
  🪙 Support with AI Tokens
</a>`;

  const cardWidget = `<!-- GiveMeSomeTokens Support Card -->
<div style="border:1px solid #27272a;border-radius:12px;padding:20px;background:#18181b;font-family:system-ui,sans-serif;max-width:280px;">
  <div style="font-size:20px;margin-bottom:8px;">🪙</div>
  <div style="font-weight:700;color:#f4f4f5;margin-bottom:4px;">Support ${username ? `@${username}` : "me"}</div>
  <div style="font-size:13px;color:#71717a;margin-bottom:16px;">Send AI tokens to fuel my work</div>
  <a href="${supportUrl}" target="_blank" style="display:block;text-align:center;background:#f97316;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
    Send tokens
  </a>
  <div style="font-size:11px;color:#52525b;margin-top:12px;text-align:center;">
    Powered by <a href="https://givemesometokens.dev" style="color:#f97316;text-decoration:none;">GiveMeSomeTokens</a>
  </div>
</div>`;

  const floatingWidget = `<!-- GiveMeSomeTokens Floating Button -->
<script>
(function(){
  var btn = document.createElement('a');
  btn.href = '${supportUrl}';
  btn.target = '_blank';
  btn.title = 'Support with AI Tokens';
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:#f97316;color:#fff;border-radius:50px;padding:12px 20px;text-decoration:none;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;box-shadow:0 4px 24px rgba(249,115,22,0.4);display:flex;align-items:center;gap:8px;';
  btn.innerHTML = '🪙 Support me';
  document.body.appendChild(btn);
})();
</script>`;

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Integrations</h1>
      <p className="text-zinc-500 text-sm mb-6">Embed a support button on your website or connect your GMT key to any AI tool.</p>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-800 mb-6 w-fit">
        <button
          onClick={() => setActiveTab("widget")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "widget" ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Website Widget
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "tools" ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          AI Tools & Coding
        </button>
      </div>

      {activeTab === "widget" && (
        <div className="space-y-6">
          {/* Profile URL banner */}
          {!username && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-400">
              Set a username in <a href="/dashboard/profile" className="underline font-medium">Profile settings</a> to personalise your widget links.
            </div>
          )}

          {/* Button widget */}
          <Card className="border-orange-500/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm mb-1">Support Button</CardTitle>
                  <p className="text-xs text-zinc-500">Paste this wherever you want — blog posts, README files, any webpage.</p>
                </div>
                <div className="rounded-lg bg-zinc-800 px-3 py-2 border border-zinc-700">
                  <a href={supportUrl} target="_blank" style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"#f97316",color:"#fff",padding:"8px 14px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:600}}>
                    🪙 Support with AI Tokens
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-zinc-800/80 rounded-lg p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap border border-zinc-700 leading-relaxed">
{buttonWidget}
              </pre>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => copy(buttonWidget, "button")}>
                {copied === "button" ? "✓ Copied!" : "Copy HTML"}
              </Button>
            </CardContent>
          </Card>

          {/* Card widget */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-sm mb-1">Support Card</CardTitle>
                  <p className="text-xs text-zinc-500">A beautiful card — great for sidebars, footers, or landing pages.</p>
                </div>
                <div className="border border-zinc-700 rounded-xl p-4 bg-zinc-800 text-sm flex-shrink-0">
                  <div className="text-xl mb-1.5">🪙</div>
                  <div className="font-bold text-zinc-100 mb-1">Support {username ? `@${username}` : "me"}</div>
                  <div className="text-xs text-zinc-500 mb-3">Send AI tokens to fuel my work</div>
                  <div className="bg-orange-500 text-white text-center text-xs font-semibold rounded-lg py-2 px-4 cursor-pointer">Send tokens</div>
                  <div className="text-xs text-zinc-600 mt-2 text-center">Powered by <span className="text-orange-400">GiveMeSomeTokens</span></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-zinc-800/80 rounded-lg p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap border border-zinc-700 leading-relaxed">
{cardWidget}
              </pre>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => copy(cardWidget, "card")}>
                {copied === "card" ? "✓ Copied!" : "Copy HTML"}
              </Button>
            </CardContent>
          </Card>

          {/* Floating widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm mb-1">Floating Button</CardTitle>
              <p className="text-xs text-zinc-500">Adds a persistent floating button in the bottom-right corner of any page.</p>
            </CardHeader>
            <CardContent>
              <pre className="bg-zinc-800/80 rounded-lg p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap border border-zinc-700 leading-relaxed">
{floatingWidget}
              </pre>
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => copy(floatingWidget, "floating")}>
                {copied === "floating" ? "✓ Copied!" : "Copy Script"}
              </Button>
            </CardContent>
          </Card>

          {/* Profile link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm mb-1">Your Public Profile</CardTitle>
              <p className="text-xs text-zinc-500">Share this link directly — supporters can browse your posts, tiers, and shop.</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={profileUrl} readOnly className="font-mono text-xs" />
                <Button size="sm" variant="secondary" onClick={() => copy(profileUrl, "profile")}>
                  {copied === "profile" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "tools" && (
        <div className="space-y-6">
          {/* GMT Key card */}
          <Card className="border-orange-500/30">
            <CardHeader><CardTitle className="text-sm">Your GMT API Key</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-zinc-500">This key routes requests to your connected providers (Claude, GPT, Gemini…) based on the model you pick.</p>
              {gmtKey ? (
                <div className="flex gap-2">
                  <Input value={gmtKey} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="secondary" onClick={() => copy(gmtKey, "key")}>
                    {copied === "key" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={genKey}>Generate GMT Key</Button>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-lg bg-zinc-800 px-3 py-2 border border-zinc-700">
                  <div className="text-xs text-zinc-500">Base URL</div>
                  <div className="text-xs font-mono text-zinc-300 mt-0.5">https://givemesometokens.dev/api/v1</div>
                </div>
                <div className="rounded-lg bg-zinc-800 px-3 py-2 border border-zinc-700">
                  <div className="text-xs text-zinc-500">Compatible with</div>
                  <div className="text-xs text-zinc-300 mt-0.5">OpenAI API v1 (any tool)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tool integrations */}
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
                        <span className="font-mono leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
