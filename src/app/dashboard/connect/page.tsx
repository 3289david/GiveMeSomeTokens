"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { isPro } from "@/lib/plan";
import Link from "next/link";

interface OAuthApp { id: string; name: string; clientId: string; redirectUris: string[]; scopes: string[]; createdAt: string }

const SCOPES = ["read_balance", "use_provider", "payment", "subscription", "read_profile"];

export default function ConnectPage() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [plan, setPlan] = useState<string>("free");
  const [name, setName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read_balance"]);
  const [loading, setLoading] = useState(false);
  const [newApp, setNewApp] = useState<{ clientId: string; clientSecret: string } | null>(null);

  useEffect(() => {
    fetch("/api/plan").then(r => r.json()).then(d => setPlan(d.plan ?? "free"));
    fetch("/api/oauth/apps").then(r => r.json()).then(d => setApps(d.apps ?? []));
  }, []);

  const load = () => fetch("/api/oauth/apps").then(r => r.json()).then(d => setApps(d.apps ?? []));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !redirectUri.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/oauth/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), redirectUris: [redirectUri.trim()], scopes }),
      });
      const d = await res.json();
      if (res.ok) { setNewApp(d); setName(""); setRedirectUri(""); load(); }
      else toast.error(d.error || "Failed to create app");
    } finally { setLoading(false); }
  };

  if (!isPro(plan)) {
    return (
      <div className="p-4 sm:p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">GMT Connect</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Create OAuth apps so other services can use &quot;Login with GiveMeSomeTokens&quot; and access user token balances.
        </p>
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold mb-2">Pro feature</h2>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            GMT Connect OAuth apps are available on the Pro plan. Upgrade to create apps that let other services authenticate users and access token balances.
          </p>
          <Button asChild>
            <Link href="/dashboard/plan">Upgrade to Pro — $9/mo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">GMT Connect</h1>
      <p className="text-zinc-500 text-sm mb-8">
        Create OAuth apps so other services can use &quot;Login with GiveMeSomeTokens&quot; and access user token balances.
      </p>

      {newApp && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 mb-6">
          <h3 className="text-sm font-semibold text-green-400 mb-2">App created — save your credentials now</h3>
          <div className="space-y-2">
            <div><label className="text-xs text-zinc-400">Client ID</label><Input value={newApp.clientId} readOnly className="font-mono text-xs mt-1" /></div>
            <div><label className="text-xs text-zinc-400">Client Secret (shown once)</label><Input value={newApp.clientSecret} readOnly className="font-mono text-xs mt-1" /></div>
          </div>
          <Button size="sm" className="mt-3" onClick={() => setNewApp(null)}>Done</Button>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-sm">Register New App</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <Input placeholder="App name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Redirect URI (https://yourapp.com/callback)" value={redirectUri} onChange={e => setRedirectUri(e.target.value)} />
            <div>
              <label className="text-xs text-zinc-400 block mb-2">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map(s => (
                  <button key={s} type="button"
                    onClick={() => setScopes(sc => sc.includes(s) ? sc.filter(x => x !== s) : [...sc, s])}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${scopes.includes(s) ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
                  >{s}</button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading || !name || !redirectUri}>Create app</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {apps.map(app => (
          <Card key={app.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{app.name}</div>
                  <div className="text-xs text-zinc-500 font-mono mt-1">{app.clientId}</div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {app.scopes.map(s => <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{s}</span>)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
