import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTokens, providerLabel } from "@/lib/utils";

export default async function UsagePage() {
  const session = await auth();
  const userId = session!.user.id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allKeys, monthUsage] = await Promise.all([
    db.gmtApiKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    db.apiUsageLog.groupBy({
      by: ["provider", "model"],
      where: { key: { userId }, createdAt: { gte: startOfMonth } },
      _sum: { tokensUsed: true },
      orderBy: { _sum: { tokensUsed: "desc" } },
    }),
  ]);

  const totalThisMonth = monthUsage.reduce((s, r) => s + (r._sum.tokensUsed ?? 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Usage</h1>
      <p className="text-zinc-500 text-sm mb-8">API usage through your GMT keys this month.</p>

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

      {monthUsage.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm">Usage by Model</CardTitle></CardHeader>
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
