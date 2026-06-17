import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTokens, providerLabel } from "@/lib/utils";
import { planLabel } from "@/lib/plan";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;
  const sessionUser = session!.user as { plan?: string };

  const [wallet, recentSupport, totalReceived, user, keyCount] = await Promise.all([
    db.wallet.findUnique({ where: { userId } }),
    db.support.findMany({
      where: { creatorId: userId },
      include: { supporter: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.support.aggregate({ where: { creatorId: userId }, _sum: { amount: true } }),
    db.user.findUnique({ where: { id: userId }, select: { username: true, name: true, creatorTier: true, plan: true } }),
    db.gmtApiKey.count({ where: { userId } }),
  ]);

  const walletItems = [
    { key: "claude",      label: "Claude",      balance: wallet?.claudeBalance ?? 0,      color: "text-orange-400" },
    { key: "openai",      label: "GPT",         balance: wallet?.openaiBalance ?? 0,      color: "text-green-400" },
    { key: "gemini",      label: "Gemini",      balance: wallet?.geminiBalance ?? 0,      color: "text-blue-400" },
    { key: "openrouter",  label: "OpenRouter",  balance: wallet?.openrouterBalance ?? 0,  color: "text-purple-400" },
    { key: "groq",        label: "Groq",        balance: wallet?.groqBalance ?? 0,        color: "text-yellow-400" },
    { key: "xai",         label: "Grok",        balance: wallet?.xaiBalance ?? 0,         color: "text-zinc-300" },
    { key: "mistral",     label: "Mistral",     balance: wallet?.mistralBalance ?? 0,     color: "text-indigo-400" },
    { key: "deepseek",    label: "DeepSeek",    balance: wallet?.deepseekBalance ?? 0,    color: "text-cyan-400" },
  ];

  const hasProviderKey = wallet && (
    wallet.claudeKeyEnc || wallet.openaiKeyEnc || wallet.geminiKeyEnc ||
    wallet.openrouterKeyEnc || wallet.groqKeyEnc || wallet.xaiKeyEnc
  );

  const plan = user?.plan ?? "free";
  const isPro = plan === "pro" || plan === "team";

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}
            {user?.username && (
              <> — <Link href={`/@${user.username}`} className="text-orange-400 hover:underline">@{user.username}</Link></>
            )}
          </p>
        </div>
        {plan !== "free" && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">{planLabel(plan)} Plan</span>
        )}
      </div>

      {/* Setup guide for new users */}
      {!hasProviderKey && (
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 mb-8">
          <h2 className="text-sm font-semibold text-orange-400 mb-3">Get started in 3 steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "1", title: "Connect an API key", desc: "Add your Claude, OpenAI, or any provider key", href: "/dashboard/providers", cta: "Add API key" },
              { step: "2", title: "Generate a GMT key", desc: "Get your OpenAI-compatible proxy key", href: "/dashboard/integrations", cta: "Get GMT key" },
              { step: "3", title: "Share your profile", desc: "Let supporters send you tokens", href: user?.username ? `/@${user.username}` : "/dashboard/profile", cta: "View profile" },
            ].map(({ step, title, desc, href, cta }) => (
              <div key={step} className="bg-zinc-900 rounded-lg p-3">
                <div className="text-orange-400 font-bold text-lg mb-1">{step}.</div>
                <div className="text-sm font-medium mb-0.5">{title}</div>
                <div className="text-xs text-zinc-500 mb-3">{desc}</div>
                <Button asChild size="sm" variant="outline" className="w-full text-xs">
                  <Link href={href}>{cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{formatTokens(totalReceived._sum.amount ?? 0)}</div>
            <div className="text-sm text-zinc-500 mt-1">Tokens received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{recentSupport.length}</div>
            <div className="text-sm text-zinc-500 mt-1">Recent supporters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{keyCount}</div>
            <div className="text-sm text-zinc-500 mt-1">GMT keys</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {user?.creatorTier ? (
                <Badge variant={user.creatorTier as "bronze" | "silver" | "gold" | "platinum"}>
                  {user.creatorTier.charAt(0).toUpperCase() + user.creatorTier.slice(1)}
                </Badge>
              ) : (
                <span className="text-zinc-500 text-sm">—</span>
              )}
            </div>
            <div className="text-sm text-zinc-500 mt-1">Creator tier</div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet + Recent supporters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              AI Wallet (14 providers)
              <Button asChild size="sm" variant="secondary">
                <Link href="/wallet">Manage</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {walletItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <span className={`text-sm font-mono font-semibold ${item.balance > 0 ? item.color : "text-zinc-700"}`}>
                  {formatTokens(item.balance)}
                </span>
              </div>
            ))}
            <Link href="/dashboard/tokens" className="text-xs text-zinc-600 hover:text-orange-400 block pt-1">
              View all 14 providers →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Supporters</CardTitle></CardHeader>
          <CardContent>
            {recentSupport.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-zinc-500 text-sm mb-3">No supporters yet.</p>
                {user?.username && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/@${user.username}`}>Share your profile</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentSupport.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">
                      {s.isAnonymous ? "Anonymous" : (s.supporter.name ?? s.supporter.username ?? "Someone")}
                    </span>
                    <span className="text-zinc-500 font-mono">+{formatTokens(s.amount)} {providerLabel(s.provider)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade prompt for free users */}
      {!isPro && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Upgrade to Pro</div>
            <div className="text-xs text-zinc-500 mt-0.5">1% fee (vs 5%), advanced analytics, OAuth apps, and subscription tiers.</div>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/plan">Upgrade — $9/mo</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
