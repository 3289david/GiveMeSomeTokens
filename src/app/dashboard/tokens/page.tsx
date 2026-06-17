import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatTokens } from "@/lib/utils";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon } from "@/components/icons";
import TokenTopup from "./topup";

const PROVIDERS = [
  { key: "claudeBalance", label: "Claude", Icon: ClaudeIcon, color: "text-orange-400", provider: "claude" },
  { key: "openaiBalance", label: "GPT (OpenAI)", Icon: OpenAIIcon, color: "text-green-400", provider: "openai" },
  { key: "geminiBalance", label: "Gemini", Icon: GeminiIcon, color: "text-blue-400", provider: "gemini" },
  { key: "openrouterBalance", label: "OpenRouter", Icon: OpenRouterIcon, color: "text-purple-400", provider: "openrouter" },
  { key: "groqBalance", label: "Groq", Icon: GroqIcon, color: "text-yellow-400", provider: "groq" },
];

export default async function TokensPage() {
  const session = await auth();
  const wallet = await db.wallet.findUnique({ where: { userId: session!.user.id } });

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Token Balances</h1>
      <p className="text-zinc-500 text-sm mb-8">
        These are tokens you can send to other creators. Connect your API keys in Providers to start receiving tokens from supporters.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {PROVIDERS.map(({ key, label, Icon, color, provider }) => {
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

      <TokenTopup />
    </div>
  );
}
