import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTokens, providerLabel } from "@/lib/utils";
import { isPro } from "@/lib/plan";
import Link from "next/link";

export default async function UsagePage() {
  const session = await auth();
  const userId = session!.user!.id;
  const userPlan = (session!.user as { plan?: string }).plan ?? "free";
  const proUser = isPro(userPlan);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOf30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allKeys, monthUsage, dailyUsage, providerUsage] = await Promise.all([
    db.gmtApiKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.apiUsageLog.groupBy({
      by: ["provider", "model"],
      where: { key: { userId }, createdAt: { gte: startOfMonth } },
      _sum: { tokensUsed: true },
      orderBy: { _sum: { tokensUsed: "desc" } },
    }),
    proUser ? db.apiUsageLog.groupBy({
      by: ["provider"],
      where: { key: { userId }, createdAt: { gte: startOf7Days } },
      _sum: { tokensUsed: true },
      orderBy: { _sum: { tokensUsed: "desc" } },
    }) : Promise.resolve([]),
    proUser ? db.apiUsageLog.groupBy({
      by: ["provider"],
      where: { key: { userId }, createdAt: { gte: startOf30Days } },
      _sum: { tokensUsed: true },
      orderBy: { _sum: { tokensUsed: "desc" } },
    }) : Promise.resolve([]),
  ]);

  const totalThisMonth = monthUsage.reduce((s, r) => s + (r._sum.tokensUsed ?? 0), 0);
  const total7Days = dailyUsage.reduce((s, r) => s + (r._sum.tokensUsed ?? 0), 0);
  const total30Days = providerUsage.reduce((s, r) => s + (r._sum.tokensUsed ?? 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Usage</h1>
        {proUser && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">Pro Analytics</span>
        )}
      </div>
      <p className="text-zinc-500 text-sm mb-8">API usage through your GMT keys.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{formatTokens(totalThisMonth)}</div>
            <div className="text-sm text-zinc-500 mt-1">Used this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{allKeys.length}</div>
            <div className="text-sm text-zinc-500 mt-1">Active GMT keys</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{monthUsage.length}</div>
            <div className="text-sm text-zinc-500 mt-1">Models used</div>
          </CardContent>
        </Card>
      </div>

      {proUser && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="border-orange-500/20">
            <CardHeader><CardTitle className="text-sm">Last 7 Days by Provider</CardTitle></CardHeader>
            <CardContent>
              {dailyUsage.length === 0 ? (
                <p className="text-zinc-500 text-sm">No usage in the past 7 days.</p>
              ) : (
                <div className="space-y-2">
                  {dailyUsage.map((u) => (
                    <div key={u.provider} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">{providerLabel(u.provider)}</span>
                      <span className="text-sm font-mono text-zinc-300">{formatTokens(u._sum.tokensUsed ?? 0)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-zinc-800 flex justify-between font-semibold text-sm">
                    <span>Total</span>
                    <span className="font-mono">{formatTokens(total7Days)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-orange-500/20">
            <CardHeader><CardTitle className="text-sm">Last 30 Days by Provider</CardTitle></CardHeader>
            <CardContent>
              {providerUsage.length === 0 ? (
                <p className="text-zinc-500 text-sm">No usage in the past 30 days.</p>
              ) : (
                <div className="space-y-2">
                  {providerUsage.map((u) => (
                    <div key={u.provider} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">{providerLabel(u.provider)}</span>
                      <span className="text-sm font-mono text-zinc-300">{formatTokens(u._sum.tokensUsed ?? 0)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-zinc-800 flex justify-between font-semibold text-sm">
                    <span>Total</span>
                    <span className="font-mono">{formatTokens(total30Days)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!proUser && (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-orange-400">Unlock Advanced Analytics</div>
            <div className="text-xs text-zinc-500 mt-0.5">7-day and 30-day breakdowns by provider and model. Pro plan only.</div>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/plan">Upgrade to Pro</Link>
          </Button>
        </div>
      )}

      {monthUsage.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm">This Month — Usage by Model</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthUsage.map((u) => (
                <div key={`${u.provider}-${u.model}`} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.model}</div>
                    <div className="text-xs text-zinc-500">{providerLabel(u.provider)}</div>
                  </div>
                  <div className="text-sm font-mono text-zinc-300">{formatTokens(u._sum.tokensUsed ?? 0)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">GMT API Keys</CardTitle></CardHeader>
        <CardContent>
          {allKeys.length === 0 ? (
            <p className="text-zinc-500 text-sm">No keys yet. Generate one in Integrations.</p>
          ) : (
            <div className="space-y-2">
              {allKeys.map((k) => (
                <div key={k.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-zinc-400 text-xs truncate flex-1">{k.key.slice(0, 20)}...</span>
                  <span className="text-zinc-500">{k.name}</span>
                  <span className="text-zinc-600 text-xs">{formatTokens(k.totalTokensUsed)} used</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
