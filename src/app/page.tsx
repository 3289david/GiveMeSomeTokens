import Link from "next/link";
import { db } from "@/lib/db";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { GmtLogo, ClaudeIcon, OpenAIIcon, GeminiIcon, FuelIcon } from "@/components/icons";
import { formatTokens, providerLabel } from "@/lib/utils";

async function getRecentSupports() {
  return db.support.findMany({
    where: { isPublic: true },
    include: {
      supporter: { select: { name: true, username: true } },
      creator: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

async function getStats() {
  const [totalSupports, totalCreators] = await Promise.all([
    db.support.count(),
    db.user.count({ where: { isCreator: true } }),
  ]);
  return { totalSupports, totalCreators };
}

export default async function HomePage() {
  const [recentSupports, stats] = await Promise.all([
    getRecentSupports(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-14 sm:pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs sm:text-sm mb-6">
            <FuelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Fund creators with AI tokens, not dollars
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-5 sm:mb-6">
            Support creators with
            <span className="gmt-gradient-text"> AI tokens</span>
          </h1>
          <p className="text-base sm:text-xl text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            The platform for AI builders. Support your favorite creators with Claude, GPT, Gemini, and OpenRouter credits instead of money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/explore">Find Creators</Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="w-full sm:w-auto">
              <Link href="/login?mode=register">Start Receiving Tokens</Link>
            </Button>
          </div>
          <div className="mt-10 sm:mt-12 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-zinc-500 flex-wrap">
            <span><strong className="text-zinc-300">{stats.totalCreators}</strong> creators</span>
            <span className="w-px h-4 bg-zinc-800 hidden sm:block" />
            <span><strong className="text-zinc-300">{stats.totalSupports}</strong> supports sent</span>
            <span className="w-px h-4 bg-zinc-800 hidden sm:block" />
            <span>4 AI providers</span>
          </div>
        </div>
      </section>

      {/* Live Feed */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Live Feed</h2>
        <div className="space-y-2">
          {recentSupports.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-500 text-sm">
              No supports yet. Be the first!
            </div>
          ) : (
            recentSupports.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 sm:px-4 py-3 text-sm flex-wrap sm:flex-nowrap"
              >
                <ProviderDot provider={s.provider} />
                <span className="text-zinc-300 font-medium">
                  {s.supporter.name ?? "Anonymous"}
                </span>
                <span className="text-zinc-500">supported</span>
                <Link
                  href={`/@${s.creator.username ?? s.creator.name}`}
                  className="text-orange-400 hover:underline font-medium"
                >
                  @{s.creator.username ?? s.creator.name}
                </Link>
                <span className="ml-auto text-zinc-400 font-mono">
                  {formatTokens(s.amount)} {providerLabel(s.provider)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect your AI keys",
                desc: "Link your Claude, OpenAI, Gemini, or OpenRouter API keys. We store them encrypted — creators never see them.",
              },
              {
                step: "02",
                title: "Support a creator",
                desc: "Choose a creator and send them tokens. Tokens go directly into their AI wallet and they use your credits for inference.",
              },
              {
                step: "03",
                title: "Creators build with your tokens",
                desc: "Creators call our API just like OpenAI. Your tokens power their agents, tools, and projects.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-zinc-800 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Providers */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Every major AI provider</h2>
          <p className="text-zinc-400 mb-10">Support creators with the tokens they actually use.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <ClaudeIcon className="w-8 h-8" />, name: "Claude", sub: "Anthropic" },
              { icon: <OpenAIIcon className="w-8 h-8" />, name: "GPT", sub: "OpenAI" },
              { icon: <GeminiIcon className="w-8 h-8" />, name: "Gemini", sub: "Google" },
              { icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#c084fc" opacity="0.15"/><path d="M4 8h16M4 12h12M4 16h8" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round"/></svg>, name: "OpenRouter", sub: "Multi-provider" },
            ].map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                {p.icon}
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-zinc-500">{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GmtLogo className="w-6 h-6" />
            <span className="text-sm text-zinc-500">GiveMeSomeTokens</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/explore" className="hover:text-zinc-300">Explore</Link>
            <Link href="/pricing" className="hover:text-zinc-300">Pricing</Link>
            <Link href="/providers" className="hover:text-zinc-300">Providers</Link>
          </div>
          <div className="text-sm text-zinc-600">givemesometokens.dev</div>
        </div>
      </footer>
    </div>
  );
}

function ProviderDot({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    claude: "bg-orange-500",
    openai: "bg-green-500",
    gemini: "bg-blue-500",
    openrouter: "bg-purple-500",
    groq: "bg-yellow-500",
  };
  return (
    <span className={`w-2 h-2 rounded-full ${colors[provider] ?? "bg-zinc-500"}`} />
  );
}
