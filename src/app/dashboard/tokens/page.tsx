import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatTokens } from "@/lib/utils";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon, XAIIcon, MistralIcon, DeepSeekIcon, CohereIcon, PerplexityIcon, TogetherIcon, FireworksIcon, CerebrasIcon, AI21Icon } from "@/components/icons";
import TokenTopup from "./topup";

const PROVIDERS = [
  { key: "claudeBalance",      label: "Claude",       Icon: ClaudeIcon,      color: "text-orange-400", provider: "claude" },
  { key: "openaiBalance",      label: "GPT (OpenAI)", Icon: OpenAIIcon,      color: "text-green-400",  provider: "openai" },
  { key: "geminiBalance",      label: "Gemini",       Icon: GeminiIcon,      color: "text-blue-400",   provider: "gemini" },
  { key: "openrouterBalance",  label: "OpenRouter",   Icon: OpenRouterIcon,  color: "text-purple-400", provider: "openrouter" },
  { key: "groqBalance",        label: "Groq",         Icon: GroqIcon,        color: "text-yellow-400", provider: "groq" },
  { key: "xaiBalance",         label: "Grok (xAI)",   Icon: XAIIcon,         color: "text-zinc-300",   provider: "xai" },
  { key: "mistralBalance",     label: "Mistral AI",   Icon: MistralIcon,     color: "text-indigo-400", provider: "mistral" },
  { key: "deepseekBalance",    label: "DeepSeek",     Icon: DeepSeekIcon,    color: "text-cyan-400",   provider: "deepseek" },
  { key: "cohereBalance",      label: "Cohere",       Icon: CohereIcon,      color: "text-rose-400",   provider: "cohere" },
  { key: "perplexityBalance",  label: "Perplexity",   Icon: PerplexityIcon,  color: "text-teal-400",   provider: "perplexity" },
  { key: "togetherBalance",    label: "Together AI",  Icon: TogetherIcon,    color: "text-violet-400", provider: "together" },
  { key: "fireworksBalance",   label: "Fireworks AI", Icon: FireworksIcon,   color: "text-amber-400",  provider: "fireworks" },
  { key: "cerebrasBalance",    label: "Cerebras",     Icon: CerebrasIcon,    color: "text-red-400",    provider: "cerebras" },
  { key: "ai21Balance",        label: "AI21 Labs",    Icon: AI21Icon,        color: "text-emerald-400", provider: "ai21" },
];

export default async function TokensPage() {
  const session = await auth();
  const wallet = await db.wallet.findUnique({ where: { userId: session!.user!.id } });

  const nonZeroProviders = PROVIDERS.filter(({ key }) =>
    wallet ? ((wallet as Record<string, unknown>)[key] as number) > 0 : false
  );
  const zeroProviders = PROVIDERS.filter(({ key }) =>
    !wallet || ((wallet as Record<string, unknown>)[key] as number) === 0
  );

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Token Balances</h1>
      <p className="text-zinc-500 text-sm mb-8">
        These are tokens you can send to other creators. Connect your API keys in <strong>API Keys</strong> to start receiving tokens from supporters.
      </p>

      {nonZeroProviders.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Active balances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {nonZeroProviders.map(({ key, label, Icon, color, provider }) => {
              const balance = wallet ? (wallet as Record<string, unknown>)[key] as number : 0;
              return (
                <Card key={key}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6" />
                      <span className="font-medium text-sm">{label}</span>
                    </div>
                    <div className={`text-3xl font-bold font-mono ${color}`}>{formatTokens(balance)}</div>
                    <div className="text-xs text-zinc-600 mt-1">tokens available</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {zeroProviders.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-zinc-600 mb-3">
            {nonZeroProviders.length > 0 ? "Other providers" : "All providers"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {zeroProviders.map(({ key, label, Icon, color }) => (
              <div key={key} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
                <Icon className="w-4 h-4 text-zinc-600" />
                <div>
                  <div className="text-xs text-zinc-600">{label}</div>
                  <div className="text-sm font-mono text-zinc-700">0</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <TokenTopup />
    </div>
  );
}
