import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon, XAIIcon, MistralIcon, DeepSeekIcon, CohereIcon, PerplexityIcon, TogetherIcon, FireworksIcon, CerebrasIcon, AI21Icon } from "@/components/icons";

const PROVIDERS = [
  {
    Icon: ClaudeIcon,
    name: "Claude",
    company: "Anthropic",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
    color: "border-orange-500/30",
    highlight: "text-orange-400",
    desc: "Anthropic's most capable models. Best for complex reasoning, coding, and analysis.",
  },
  {
    Icon: OpenAIIcon,
    name: "GPT",
    company: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o4-mini"],
    color: "border-green-500/30",
    highlight: "text-green-400",
    desc: "OpenAI's GPT models. Industry standard for chat and code completion.",
  },
  {
    Icon: GeminiIcon,
    name: "Gemini",
    company: "Google",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
    color: "border-blue-500/30",
    highlight: "text-blue-400",
    desc: "Google's multimodal models with long context windows.",
  },
  {
    Icon: OpenRouterIcon,
    name: "OpenRouter",
    company: "OpenRouter",
    models: ["All 200+ models via routing"],
    color: "border-purple-500/30",
    highlight: "text-purple-400",
    desc: "Access 200+ models from every major provider through a single API.",
  },
  {
    Icon: GroqIcon,
    name: "Groq",
    company: "Groq",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    color: "border-yellow-500/30",
    highlight: "text-yellow-400",
    desc: "Blazing fast inference with Groq's LPU chips. Best for low-latency tasks.",
  },
  {
    Icon: XAIIcon,
    name: "Grok",
    company: "xAI",
    models: ["grok-3", "grok-3-mini", "grok-2-1212"],
    color: "border-zinc-500/30",
    highlight: "text-zinc-300",
    desc: "xAI's Grok models with real-time web access and advanced reasoning.",
  },
  {
    Icon: MistralIcon,
    name: "Mistral",
    company: "Mistral AI",
    models: ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
    color: "border-indigo-500/30",
    highlight: "text-indigo-400",
    desc: "European frontier AI with strong coding and multilingual capabilities.",
  },
  {
    Icon: DeepSeekIcon,
    name: "DeepSeek",
    company: "DeepSeek",
    models: ["deepseek-chat", "deepseek-reasoner"],
    color: "border-cyan-500/30",
    highlight: "text-cyan-400",
    desc: "State-of-the-art open models with exceptional reasoning at low cost.",
  },
  {
    Icon: CohereIcon,
    name: "Cohere",
    company: "Cohere",
    models: ["command-r-plus", "command-r", "command-a-03-2025"],
    color: "border-coral-500/30",
    highlight: "text-rose-400",
    desc: "Powerful enterprise-focused models optimized for RAG and search.",
  },
  {
    Icon: PerplexityIcon,
    name: "Perplexity",
    company: "Perplexity AI",
    models: ["llama-3.1-sonar-large-128k-online", "sonar-pro"],
    color: "border-teal-500/30",
    highlight: "text-teal-400",
    desc: "AI models with real-time web search and citations built in.",
  },
  {
    Icon: TogetherIcon,
    name: "Together AI",
    company: "Together AI",
    models: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "Qwen/Qwen2.5-72B-Instruct-Turbo"],
    color: "border-violet-500/30",
    highlight: "text-violet-400",
    desc: "Fast open-source model inference with 100+ models available.",
  },
  {
    Icon: FireworksIcon,
    name: "Fireworks",
    company: "Fireworks AI",
    models: ["accounts/fireworks/models/llama-v3p1-70b-instruct", "firefunction-v2"],
    color: "border-amber-500/30",
    highlight: "text-amber-400",
    desc: "Production-grade inference for open models with function calling.",
  },
  {
    Icon: CerebrasIcon,
    name: "Cerebras",
    company: "Cerebras",
    models: ["llama3.3-70b", "llama3.1-8b"],
    color: "border-red-500/30",
    highlight: "text-red-400",
    desc: "World's fastest AI inference on Cerebras Wafer-Scale Engine chips.",
  },
  {
    Icon: AI21Icon,
    name: "AI21 Labs",
    company: "AI21",
    models: ["jamba-1.5-large", "jamba-1.5-mini"],
    color: "border-emerald-500/30",
    highlight: "text-emerald-400",
    desc: "Jamba models with hybrid SSM-Transformer architecture for long context.",
  },
];

export default function ProvidersPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3">14 Supported AI Providers</h1>
          <p className="text-zinc-400 max-w-2xl">
            Connect your own API keys (BYOK — Bring Your Own Key). Your keys stay AES-256-GCM encrypted on our servers.
            Supporters send you tokens, and your calls are automatically routed through those token balances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <p>1. Connect your API key in the dashboard (stored AES-256-GCM encrypted — never exposed).</p>
            <p>2. Use your GMT key (<span className="font-mono text-zinc-300">gmt_xxx</span>) in any OpenAI-compatible tool.</p>
            <p>3. Requests hit <span className="font-mono text-zinc-300">https://givemesometokens.dev/api/v1/chat/completions</span>.</p>
            <p>4. The proxy decrypts your stored key, forwards the request to the correct provider, and deducts tokens from your wallet.</p>
            <p>5. Supporters&apos; token donations become your API budget — no API key is ever shared.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
