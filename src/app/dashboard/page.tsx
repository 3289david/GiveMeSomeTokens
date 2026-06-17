import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTokens, providerLabel } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [wallet, recentSupport, totalReceived] = await Promise.all([
    db.wallet.findUnique({ where: { userId } }),
    db.support.findMany({
      where: { creatorId: userId },
      include: { supporter: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.support.aggregate({
      where: { creatorId: userId },
      _sum: { amount: true },
    }),
  ]);

  const walletItems = [
    { key: "claude", label: "Claude", balance: wallet?.claudeBalance ?? 0, color: "text-orange-400" },
    { key: "openai", label: "GPT", balance: wallet?.openaiBalance ?? 0, color: "text-green-400" },
    { key: "gemini", label: "Gemini", balance: wallet?.geminiBalance ?? 0, color: "text-blue-400" },
    { key: "openrouter", label: "OpenRouter", balance: wallet?.openrouterBalance ?? 0, color: "text-purple-400" },
    { key: "groq", label: "Groq", balance: wallet?.groqBalance ?? 0, color: "text-yellow-400" },
  ];

  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true, name: true, creatorTier: true } });

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}
          {user?.username && (
            <> — <Link href={`/@${user.username}`} className="text-orange-400 hover:underline">@{user.username}</Link></>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{formatTokens(totalReceived._sum.amount ?? 0)}</div>
            <div className="text-sm text-zinc-500 mt-1">Total tokens received</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{recentSupport.length > 0 ? recentSupport.length : 0}</div>
            <div className="text-sm text-zinc-500 mt-1">Recent supporters</div>
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
                <span className="text-zinc-500 text-sm">No tier yet</span>
              )}
            </div>
            <div className="text-sm text-zinc-500 mt-1">Creator tier</div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              AI Wallet
              <Button asChild size="sm" variant="secondary">
                <Link href="/wallet">Manage</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {walletItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <span className={`text-sm font-mono font-semibold ${item.color}`}>
                  {formatTokens(item.balance)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recent Supporters</CardTitle></CardHeader>
          <CardContent>
            {recentSupport.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">
                No supporters yet.{" "}
                {user?.username && (
                  <Link href={`/@${user.username}`} className="text-orange-400 hover:underline">
                    Share your profile
                  </Link>
                )}
              </p>
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
    </div>
  );
}
