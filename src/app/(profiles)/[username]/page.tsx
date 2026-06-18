import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, FuelIcon } from "@/components/icons";
import { formatTokens, providerLabel } from "@/lib/utils";
import MembershipSection from "./membership-section";
import PostsFeed from "./posts-feed";

async function getCreator(username: string) {
  return db.user.findUnique({
    where: { username },
    include: {
      projects: true,
      goals: { where: { completed: false } },
      membershipTiers: { where: { active: true }, orderBy: { position: "asc" } },
      supportReceived: {
        where: { isPublic: true },
        include: { supporter: { select: { name: true, username: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

async function getTokenTotals(userId: string) {
  const totals = await db.support.groupBy({
    by: ["provider"],
    where: { creatorId: userId },
    _sum: { amount: true },
  });
  const map: Record<string, number> = {};
  let grand = 0;
  for (const t of totals) {
    map[t.provider] = t._sum.amount ?? 0;
    grand += t._sum.amount ?? 0;
  }
  return { map, grand };
}

function getTier(total: number): { label: string; variant: "bronze" | "silver" | "gold" | "platinum" | null } {
  if (total >= 100000) return { label: "Platinum", variant: "platinum" };
  if (total >= 10000) return { label: "Gold", variant: "gold" };
  if (total >= 1000) return { label: "Silver", variant: "silver" };
  if (total >= 100) return { label: "Bronze", variant: "bronze" };
  return { label: "", variant: null };
}

async function getViewerSubscriptions(viewerId: string, creatorId: string) {
  return db.subscription.findMany({
    where: { supporterId: viewerId, creatorId, active: true },
    select: { tierId: true },
  });
}

async function getPosts(creatorId: string, viewerTierIds: string[]) {
  const posts = await db.post.findMany({
    where: { creatorId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { memberTier: { select: { id: true, name: true, color: true, emoji: true } } },
  });

  return posts.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    locked: !p.isPublic && !viewerTierIds.includes(p.tierId ?? ""),
    content: (!p.isPublic && !viewerTierIds.includes(p.tierId ?? "")) ? null : p.content,
  }));
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getCreator(username);
  if (!creator) notFound();

  const { map: tokenTotals, grand: grandTotal } = await getTokenTotals(creator.id);
  const tier = getTier(grandTotal);
  const session = await auth();

  // Get viewer's active subscriptions to this creator
  let viewerTierIds: string[] = [];
  let activeTierIds: string[] = [];
  if (session?.user?.id && session.user.id !== creator.id) {
    const subs = await getViewerSubscriptions(session.user.id, creator.id);
    viewerTierIds = subs.map(s => s.tierId!).filter(Boolean);
    activeTierIds = viewerTierIds;
  }

  // Fetch posts with access control
  const posts = await getPosts(creator.id, viewerTierIds);

  const providers = [
    { key: "claude", Icon: ClaudeIcon, label: "Claude", color: "text-orange-400" },
    { key: "openai", Icon: OpenAIIcon, label: "GPT", color: "text-green-400" },
    { key: "gemini", Icon: GeminiIcon, label: "Gemini", color: "text-blue-400" },
    { key: "openrouter", Icon: OpenRouterIcon, label: "OpenRouter", color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {creator.image ? (
                    <Image src={creator.image} alt={creator.name ?? ""} width={80} height={80} className="rounded-full mb-4" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold mb-4">
                      {(creator.name ?? username)[0].toUpperCase()}
                    </div>
                  )}
                  <h1 className="text-xl font-bold">{creator.name ?? username}</h1>
                  <p className="text-zinc-500 text-sm">@{creator.username}</p>
                  {tier.variant && (
                    <Badge variant={tier.variant} className="mt-2">{tier.label} Creator</Badge>
                  )}
                  {creator.bio && (
                    <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{creator.bio}</p>
                  )}
                  <div className="flex items-center gap-3 mt-4 text-zinc-500">
                    {creator.website && (
                      <a href={creator.website} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 text-xs">{creator.website.replace(/^https?:\/\//, "")}</a>
                    )}
                    {creator.github && (
                      <a href={`https://github.com/${creator.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 text-xs">GitHub</a>
                    )}
                    {creator.twitter && (
                      <a href={`https://x.com/${creator.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 text-xs">X</a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token totals */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Tokens Received</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {providers.map(({ key, Icon, label, color }) => (
                  tokenTotals[key] ? (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm text-zinc-400 flex-1">{label}</span>
                      <span className={`text-sm font-mono font-semibold ${color}`}>
                        {formatTokens(tokenTotals[key])}
                      </span>
                    </div>
                  ) : null
                ))}
                {grandTotal > 0 && (
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm">
                    <span className="text-zinc-500">Total</span>
                    <span className="font-semibold font-mono">{formatTokens(grandTotal)}</span>
                  </div>
                )}
                {grandTotal === 0 && (
                  <p className="text-zinc-500 text-sm text-center py-2">No tokens received yet</p>
                )}
              </CardContent>
            </Card>

            {/* Projects */}
            {creator.projects.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Projects</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {creator.projects.map((p) => (
                    <div key={p.id} className="rounded-lg bg-zinc-800 px-3 py-2">
                      <div className="text-sm font-medium">{p.name}</div>
                      {p.description && <div className="text-xs text-zinc-500 mt-0.5">{p.description}</div>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Support + Memberships + Posts + Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fuel My Agent CTA */}
            <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-purple-500/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <FuelIcon className="w-5 h-5 text-orange-400" />
                <h2 className="font-semibold">Fuel My Agent</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Help {creator.name ?? username} keep building with AI tokens instead of money.
              </p>
              <Button asChild size="lg" variant="gradient" className="w-full">
                <Link href={`/@${username}/support`}>
                  Support with AI Tokens
                </Link>
              </Button>
            </div>

            {/* Membership Tiers */}
            {creator.membershipTiers.length > 0 && (
              <MembershipSection
                tiers={creator.membershipTiers}
                creatorUsername={username}
                activeTierIds={activeTierIds}
              />
            )}

            {/* Goals */}
            {creator.goals.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Goals</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {creator.goals.map((goal) => {
                    const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    return (
                      <div key={goal.id}>
                        <div className="mb-1">
                          <span className="text-zinc-300 text-sm block mb-0.5">{goal.description}</span>
                          <span className="text-zinc-500 font-mono text-xs">
                            {formatTokens(goal.currentAmount)} / {formatTokens(goal.targetAmount)} {providerLabel(goal.provider)}
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            {posts.length > 0 && (
              <PostsFeed posts={posts} />
            )}

            {/* Recent Supporters */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Supporters</CardTitle></CardHeader>
              <CardContent>
                {creator.supportReceived.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">No supporters yet. Be the first!</p>
                ) : (
                  <div className="space-y-3">
                    {creator.supportReceived.map((s) => (
                      <div key={s.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {s.isAnonymous ? "A" : (s.supporter.name ?? "?")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {s.isAnonymous ? "Anonymous" : (s.supporter.name ?? s.supporter.username ?? "Someone")}
                          </div>
                          {s.message && <div className="text-xs text-zinc-500 truncate">&quot;{s.message}&quot;</div>}
                        </div>
                        <ProviderBadge provider={s.provider} amount={s.amount} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderBadge({ provider, amount }: { provider: string; amount: number }) {
  const colors: Record<string, string> = {
    claude: "bg-orange-500/20 text-orange-400",
    openai: "bg-green-500/20 text-green-400",
    gemini: "bg-blue-500/20 text-blue-400",
    openrouter: "bg-purple-500/20 text-purple-400",
    groq: "bg-yellow-500/20 text-yellow-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold flex-shrink-0 ${colors[provider] ?? "bg-zinc-800 text-zinc-400"}`}>
      +{formatTokens(amount)}
    </span>
  );
}
