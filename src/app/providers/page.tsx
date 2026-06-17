import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon } from "@/components/icons";

const PROVIDERS = [
  {
    Icon: ClaudeIcon,
    name: "Claude",
    company: "Anthropic",
    models: ["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
    color: "border-orange-500/30",
    highlight: "text-orange-400",
    desc: "Anthropic's most capable models. Best for complex reasoning, coding, and analysis.",
  },
  {
    Icon: OpenAIIcon,
    name: "GPT",
    company: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"],
    color: "border-green-500/30",
    highlight: "text-green-400",
    desc: "OpenAI's GPT models. Industry standard for chat and code completion.",
  },
  {
    Icon: GeminiIcon,
    name: "Gemini",
    company: "Google",
    models: ["gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.5-flash"],
    color: "border-blue-500/30",
    highlight: "text-blue-400",
    desc: "Google's multimodal models with long context windows.",
  },
  {
    Icon: OpenRouterIcon,
    name: "OpenRouter",
    company: "OpenRouter",
    models: ["All 100+ models via routing"],
    color: "border-purple-500/30",
    highlight: "text-purple-400",
    desc: "Access 100+ models from multiple providers through a single API.",
  },
  {
    Icon: GroqIcon,
    name: "Groq",
    company: "Groq",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
    color: "border-yellow-500/30",
    highlight: "text-yellow-400",
    desc: "Blazing fast inference with Groq's LPU chips.",
  },
];

export default function ProvidersPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3">Supported Providers</h1>
          <p className="text-zinc-400 max-w-2xl">
            Connect your own API keys (BYOK — Bring Your Own Key). Your keys stay encrypted on our servers. Supporters send you tokens, and your calls are automatically routed through those token balances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVIDERS.map(({ Icon, name, company, models, color, highlight, desc }) => (
            <Card key={name} className={`border ${color}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="w-8 h-8" />
                  <div>
                    <CardTitle className={`text-sm ${highlight}`}>{name}</CardTitle>
                    <p className="text-xs text-zinc-500">{company}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400 mb-3">{desc}</p>
                <div className="space-y-1">
                  {models.map((m) => (
                    <div key={m} className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-1 rounded">{m}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-semibold mb-3">How the API proxy works</h2>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>1. Creator connects their API key in the dashboard (stored AES-256-GCM encrypted).</p>
            <p>2. Creator uses their GMT key (<span className="font-mono text-zinc-300">gmt_xxx</span>) in any OpenAI-compatible tool.</p>
            <p>3. Requests hit <span className="font-mono text-zinc-300">givemesometokens.dev/api/v1/chat/completions</span>.</p>
            <p>4. The proxy decrypts the stored key, forwards the request to the correct provider, and deducts tokens from the wallet.</p>
            <p>5. Supporters&apos; token donations become the creator&apos;s API budget — no API key is ever shared.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
