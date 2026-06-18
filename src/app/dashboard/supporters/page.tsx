import { auth } from "@/auth";
import { db } from "@/lib/db";
import { providerLabel } from "@/lib/utils";

function KeyStatusBadge({ active, tokensUsed, tokenLimit }: { active: boolean; tokensUsed: number; tokenLimit: number }) {
  if (!active) return <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">Exhausted</span>;
  if (tokenLimit > 0) {
    const pct = Math.round((tokensUsed / tokenLimit) * 100);
    const color = pct >= 90 ? "text-red-400 bg-red-500/10" : pct >= 60 ? "text-yellow-400 bg-yellow-500/10" : "text-green-400 bg-green-500/10";
    return <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{pct}% used</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Active</span>;
}

export default async function SupportersPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [supporterKeys, legacySupports] = await Promise.all([
    db.supporterKey.findMany({
      where: { creatorId: userId },
      include: { supporter: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.support.findMany({
      where: { creatorId: userId },
      include: { supporter: { select: { name: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const totalTokensAvailable = supporterKeys
    .filter(k => k.active && k.tokenLimit > 0)
    .reduce((sum, k) => sum + (k.tokenLimit - k.tokensUsed), 0);
  const totalTokensUsed = supporterKeys.reduce((sum, k) => sum + k.tokensUsed, 0);

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Supporters</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Supporters donate their real API keys — you use tokens via GMT, they pay their AI provider directly.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold font-mono text-orange-400">{supporterKeys.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Keys donated</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold font-mono text-green-400">
            {totalTokensAvailable.toFixed(1)}M
          </div>
          <div className="text-xs text-zinc-500 mt-1">Tokens remaining</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold font-mono text-blue-400">
            {totalTokensUsed.toFixed(2)}M
          </div>
          <div className="text-xs text-zinc-500 mt-1">Tokens used</div>
        </div>
      </div>

      {/* Supporter keys */}
      <h2 className="text-sm font-semibold text-zinc-300 mb-3">Donated API keys</h2>
      {supporterKeys.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <p className="text-zinc-500 text-sm mb-2">No supporters yet</p>
          <p className="text-xs text-zinc-600">Share your profile link so supporters can donate their API keys</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {supporterKeys.map(k => {
            const name = k.supporterId
              ? (k.supporter?.name ?? k.supporter?.username ?? "Unknown")
              : "Anonymous";
            const progress = k.tokenLimit > 0 ? (k.tokensUsed / k.tokenLimit) * 100 : 0;
            return (
              <div key={k.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 flex-shrink-0">
                      {name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{name}</div>
                      <div className="text-xs text-zinc-500 flex gap-2 mt-0.5 flex-wrap">
                        <span>{providerLabel(k.provider)}</span>
                        <span>····{k.keyHint}</span>
                        <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                      </div>
                      {k.note && <div className="text-xs text-zinc-400 mt-1 italic">&ldquo;{k.note}&rdquo;</div>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <KeyStatusBadge active={k.active} tokensUsed={k.tokensUsed} tokenLimit={k.tokenLimit} />
                  </div>
                </div>

                {k.tokenLimit > 0 ? (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>{k.tokensUsed.toFixed(2)}M used</span>
                      <span>{k.tokenLimit}M limit</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progress >= 90 ? "bg-red-500" : progress >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-zinc-600">{k.tokensUsed.toFixed(3)}M tokens used · no limit set</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {legacySupports.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Support history</h2>
          <div className="space-y-2">
            {legacySupports.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm">
                <span className="text-zinc-300">
                  {s.isAnonymous ? "Anonymous" : (s.supporter.name ?? s.supporter.username ?? "Someone")}
                </span>
                <div className="text-right">
                  <span className="text-zinc-400 font-mono text-xs">{providerLabel(s.provider)}</span>
                  <div className="text-xs text-zinc-600">{new Date(s.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
