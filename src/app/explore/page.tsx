import { db } from "@/lib/db";
import { Nav } from "@/components/nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTokens } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

async function getCreators() {
  const creators = await db.user.findMany({
    where: { isCreator: true, username: { not: null } },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      creatorTier: true,
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  const withTotals = await Promise.all(
    creators.map(async (c) => {
      const agg = await db.support.aggregate({ where: { creatorId: c.id }, _sum: { amount: true } });
      return { ...c, total: agg._sum.amount ?? 0 };
    })
  );

  return withTotals.sort((a, b) => b.total - a.total);
}

export default async function ExplorePage() {
  const creators = await getCreators();

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Explore Creators</h1>
          <p className="text-zinc-500 mt-2">Support AI builders with tokens instead of money</p>
        </div>

        {creators.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-4">No creators yet</p>
            <Button asChild>
              <Link href="/login?mode=register">Become the first creator</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((c) => (
              <Card key={c.id} className="hover:border-zinc-700 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    {c.image ? (
                      <Image src={c.image} alt={c.name ?? ""} width={40} height={40} className="rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {(c.name ?? c.username ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{c.name ?? c.username}</div>
                      <div className="text-xs text-zinc-500">@{c.username}</div>
                    </div>
                    {c.creatorTier && (
                      <Badge variant={c.creatorTier as "bronze" | "silver" | "gold" | "platinum"} className="flex-shrink-0 text-xs">
                        {c.creatorTier.charAt(0).toUpperCase() + c.creatorTier.slice(1)}
                      </Badge>
                    )}
                  </div>
                  {c.bio && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{c.bio}</p>}
                  <div className="flex items-center justify-between">
                    {c.total > 0 ? (
                      <span className="text-xs text-zinc-500">{formatTokens(c.total)} tokens received</span>
                    ) : (
                      <span className="text-xs text-zinc-600">New creator</span>
                    )}
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/@${c.username}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
