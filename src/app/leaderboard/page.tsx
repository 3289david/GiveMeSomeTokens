import { db } from "@/lib/db";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTokens } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

async function getMonthlyStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [topCreatorRows, topSupporterRows] = await Promise.all([
    db.support.groupBy({
      by: ["creatorId"],
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    }),
    db.support.groupBy({
      by: ["supporterId"],
      where: { createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    }),
  ]);

  const [creatorIds, supporterIds] = [
    topCreatorRows.map((r) => r.creatorId),
    topSupporterRows.map((r) => r.supporterId),
  ];

  const [creators, supporters] = await Promise.all([
    db.user.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, name: true, username: true, image: true, creatorTier: true },
    }),
    db.user.findMany({
      where: { id: { in: supporterIds } },
      select: { id: true, name: true, username: true, image: true },
    }),
  ]);

  const creatorsMap = Object.fromEntries(creators.map((c) => [c.id, c]));
  const supportersMap = Object.fromEntries(supporters.map((s) => [s.id, s]));

  return {
    topCreators: topCreatorRows.map((r) => ({ ...creatorsMap[r.creatorId], total: r._sum.amount ?? 0 })),
    topSupporters: topSupporterRows.map((r) => ({ ...supportersMap[r.supporterId], total: r._sum.amount ?? 0 })),
  };
}

export default async function LeaderboardPage() {
  const { topCreators, topSupporters } = await getMonthlyStats();
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-zinc-500 mt-2">{monthName} {now.getFullYear()} rankings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle className="text-sm">Top Creators — Most Tokens Received</CardTitle></CardHeader>
            <CardContent>
              {topCreators.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">No data yet this month</p>
              ) : (
                <div className="space-y-3">
                  {topCreators.map((c, i) => c.username && (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-bold text-zinc-600">#{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {c.image ? <Image src={c.image} alt="" width={32} height={32} className="rounded-full" /> : (c.name ?? c.username ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/@${c.username}`} className="text-sm font-medium hover:text-orange-400 truncate block">
                          {c.name ?? c.username}
                        </Link>
                        <div className="text-xs text-zinc-500">@{c.username}</div>
                      </div>
                      {c.creatorTier && <Badge variant={c.creatorTier as "bronze" | "silver" | "gold" | "platinum"} className="text-xs">{c.creatorTier}</Badge>}
                      <span className="text-sm font-mono font-semibold text-orange-400">{formatTokens(c.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Top Supporters — Most Tokens Sent</CardTitle></CardHeader>
            <CardContent>
              {topSupporters.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">No data yet this month</p>
              ) : (
                <div className="space-y-3">
                  {topSupporters.map((s, i) => s.username && (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-bold text-zinc-600">#{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(s.name ?? s.username ?? "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/@${s.username}`} className="text-sm font-medium hover:text-orange-400 truncate block">
                          {s.name ?? s.username}
                        </Link>
                        <div className="text-xs text-zinc-500">@{s.username}</div>
                      </div>
                      <span className="text-sm font-mono font-semibold text-blue-400">{formatTokens(s.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
