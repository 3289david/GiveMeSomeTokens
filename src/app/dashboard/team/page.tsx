import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isTeam } from "@/lib/plan";
import { formatTokens } from "@/lib/utils";
import Link from "next/link";

export default async function TeamPage() {
  const session = await auth();
  const userPlan = (session!.user as { plan?: string }).plan ?? "free";

  if (!isTeam(userPlan)) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Team</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Pool token balances across your team and manage shared wallets.
        </p>
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-lg font-semibold mb-2">Team plan feature</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            Token pooling, shared wallets, and team analytics are available on the Team plan.
            Perfect for studios, companies, and developer teams.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto text-left">
            {["Team token pooling", "Shared wallet", "Up to 10 members", "Team analytics", "Invoicing", "SLA support"].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <svg className="w-3 h-3 text-orange-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {f}
              </div>
            ))}
          </div>
          <Button asChild>
            <Link href="/dashboard/plan">Upgrade to Team — $29/mo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userId = session!.user!.id as string;
  const wallet = await db.wallet.findUnique({ where: { userId } });

  const totalBalance = wallet
    ? (wallet.claudeBalance + wallet.openaiBalance + wallet.geminiBalance + wallet.openrouterBalance +
       wallet.groqBalance + wallet.xaiBalance + wallet.mistralBalance + wallet.deepseekBalance +
       wallet.cohereBalance + wallet.perplexityBalance + wallet.togetherBalance + wallet.fireworksBalance +
       wallet.cerebrasBalance + wallet.ai21Balance)
    : 0;

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Team</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">Team Plan</span>
      </div>
      <p className="text-zinc-500 text-sm mb-8">Manage your team&apos;s shared token pool and members.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{formatTokens(totalBalance)}</div>
            <div className="text-sm text-zinc-500 mt-1">Total pool balance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">1</div>
            <div className="text-sm text-zinc-500 mt-1">Team members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">0%</div>
            <div className="text-sm text-zinc-500 mt-1">Platform fee</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
              {session!.user!.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{session!.user!.name ?? session!.user!.email}</div>
              <div className="text-xs text-zinc-500">{session!.user!.email}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">Owner</span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <Button size="sm" variant="outline" disabled>
              Invite team member (up to 10)
            </Button>
            <p className="text-xs text-zinc-600 mt-2">Team invitations coming soon — contact support to add members.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Team Analytics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-zinc-500 text-sm">Team-wide usage analytics and reporting available once multiple members are added.</p>
        </CardContent>
      </Card>
    </div>
  );
}
