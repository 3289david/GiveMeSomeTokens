import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GmtLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  read_balance: "Read your token balances",
  use_provider: "Use AI providers through your wallet",
  payment: "Initiate token payments on your behalf",
  subscription: "Create subscriptions using your tokens",
  read_profile: "Read your public profile information",
};

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { client_id, redirect_uri, scope = "", state, response_type } = params;

  const session = await auth();
  if (!session?.user) {
    const returnUrl = encodeURIComponent(`/oauth/authorize?${new URLSearchParams(params)}`);
    redirect(`/login?callbackUrl=${returnUrl}`);
  }

  if (!client_id || !redirect_uri) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Invalid OAuth request</div>
      </div>
    );
  }

  const app = await db.oAuthApp.findUnique({
    where: { clientId: client_id },
    include: { creator: { select: { name: true, username: true } } },
  });

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Unknown application</div>
      </div>
    );
  }

  const scopes = scope.split(" ").filter(Boolean);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <GmtLogo className="w-10 h-10" />
            <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg font-bold">
              {app.name[0].toUpperCase()}
            </div>
          </div>

          <h1 className="text-lg font-bold text-center mb-1">{app.name} wants access</h1>
          <p className="text-sm text-zinc-500 text-center mb-6">
            Signed in as <span className="text-zinc-300">{session.user.email}</span>
          </p>

          {scopes.length > 0 && (
            <div className="space-y-2 mb-6">
              <p className="text-xs text-zinc-400 font-medium">This app will be able to:</p>
              {scopes.map((s) => (
                <div key={s} className="flex items-start gap-2 text-sm text-zinc-300">
                  <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {SCOPE_DESCRIPTIONS[s] ?? s}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href={`${redirect_uri}?error=access_denied${state ? `&state=${state}` : ""}`}>
                Deny
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1"
            >
              <Link href={`/api/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scope}&state=${state}&response_type=${response_type}`}>
                Allow
              </Link>
            </Button>
          </div>

          <p className="text-xs text-zinc-600 text-center mt-4">
            Created by @{app.creator.username ?? app.creator.name}
          </p>
        </div>
      </div>
    </div>
  );
}
