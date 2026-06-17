import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatTokens, providerLabel } from "@/lib/utils";

export default async function SupportersPage() {
  const session = await auth();
  const supporters = await db.support.findMany({
    where: { creatorId: session!.user!.id },
    include: { supporter: { select: { name: true, username: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Aggregate by supporter
  const bySupporter: Record<string, { name: string; username: string | null; total: number; count: number; providers: Record<string, number> }> = {};
  for (const s of supporters) {
    const id = s.isAnonymous ? "anonymous" : s.supporterId;
    if (!bySupporter[id]) {
      bySupporter[id] = {
        name: s.isAnonymous ? "Anonymous" : (s.supporter.name ?? s.supporter.username ?? "Unknown"),
        username: s.isAnonymous ? null : s.supporter.username,
        total: 0,
        count: 0,
        providers: {},
      };
    }
    bySupporter[id].total += s.amount;
    bySupporter[id].count += 1;
    bySupporter[id].providers[s.provider] = (bySupporter[id].providers[s.provider] ?? 0) + s.amount;
  }

  const sorted = Object.entries(bySupporter).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Supporters</h1>
      <p className="text-zinc-500 text-sm mb-8">{supporters.length} total support transactions</p>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No supporters yet. Share your profile!</div>
        ) : (
          sorted.map(([id, s]) => (
            <Card key={id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{s.name}</div>
                    {s.username && <div className="text-xs text-zinc-500">@{s.username}</div>}
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {Object.entries(s.providers).map(([p, amt]) => (
                        <span key={p} className="text-xs text-zinc-400">
                          {formatTokens(amt)} {providerLabel(p)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono">{formatTokens(s.total)}</div>
                    <div className="text-xs text-zinc-600">{s.count} support{s.count > 1 ? "s" : ""}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
