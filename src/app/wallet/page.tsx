import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTokens } from "@/lib/utils";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon } from "@/components/icons";
import Link from "next/link";

const WALLET_PROVIDERS = [
  { key: "claudeBalance", label: "Claude", sub: "Anthropic", Icon: ClaudeIcon, color: "text-orange-400", bg: "from-orange-500/10" },
  { key: "openaiBalance", label: "GPT", sub: "OpenAI", Icon: OpenAIIcon, color: "text-green-400", bg: "from-green-500/10" },
  { key: "geminiBalance", label: "Gemini", sub: "Google", Icon: GeminiIcon, color: "text-blue-400", bg: "from-blue-500/10" },
  { key: "openrouterBalance", label: "OpenRouter", sub: "Multi-provider", Icon: OpenRouterIcon, color: "text-purple-400", bg: "from-purple-500/10" },
  { key: "groqBalance", label: "Groq", sub: "Fast inference", Icon: GroqIcon, color: "text-yellow-400", bg: "from-yellow-500/10" },
];

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const wallet = await db.wallet.findUnique({ where: { userId: session.user.id } });

  const total = WALLET_PROVIDERS.reduce((sum, p) => {
    const balance = wallet ? (wallet as Record<string, unknown>)[p.key] as number : 0;
    return sum + balance;
  }, 0);

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">AI Wallet</h1>
            <p className="text-zinc-500 text-sm mt-1">Your token balances across all providers</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/providers">Connect API Keys</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-zinc-900 p-6 mb-8">
          <div className="text-sm text-zinc-500 mb-1">Total Balance</div>
          <div className="text-4xl font-bold font-mono gmt-gradient-text">{formatTokens(total)}</div>
          <div className="text-zinc-500 text-sm mt-1">tokens across all providers</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {WALLET_PROVIDERS.map(({ key, label, sub, Icon, color, bg }) => {
            const balance = wallet ? (wallet as Record<string, unknown>)[key] as number : 0;
            return (
              <div key={key} className={`rounded-xl border border-zinc-800 bg-gradient-to-br ${bg} to-zinc-900 p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs text-zinc-500">{sub}</div>
                  </div>
                  <Icon className="w-8 h-8" />
                </div>
                <div className={`text-2xl font-bold font-mono ${color}`}>{formatTokens(balance)}</div>
                <div className="text-xs text-zinc-600 mt-1">tokens available</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Tokens</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-zinc-500">
                Tokens come from supporters who fund your work. Share your profile to receive tokens.
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href={`/@${(session.user as typeof session.user & { username?: string }).username ?? session.user.id}`}>
                  View my profile
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Use Tokens</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-zinc-500">
                Use your GMT key in Cursor, Cline, Continue, or any OpenAI-compatible tool.
              </p>
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link href="/dashboard/integrations">Setup integrations</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
