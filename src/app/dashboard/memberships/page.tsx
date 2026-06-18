"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ALL_PROVIDERS, providerLabel } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  description?: string;
  provider: string;
  monthlyAmount: number;
  perks: string[];
  color: string;
  emoji: string;
  active: boolean;
}

interface Subscriber {
  id: string;
  supporter: { name: string | null; username: string | null };
  provider: string;
  amount: number;
  tier: string | null;
  tierId: string | null;
  lastBilledAt: string | null;
  nextBillAt: string | null;
  createdAt: string;
}

const COLORS = [
  { value: "orange", label: "Orange", cls: "bg-orange-500" },
  { value: "blue", label: "Blue", cls: "bg-blue-500" },
  { value: "purple", label: "Purple", cls: "bg-purple-500" },
  { value: "gold", label: "Gold", cls: "bg-yellow-500" },
  { value: "green", label: "Green", cls: "bg-green-500" },
];
const EMOJIS = ["⭐", "🚀", "💎", "🔥", "🎯", "🌟", "👑", "⚡", "🎨", "🤖"];

const tierBg: Record<string, string> = {
  orange: "from-orange-500/15 to-orange-500/5 border-orange-500/30",
  blue: "from-blue-500/15 to-blue-500/5 border-blue-500/30",
  purple: "from-purple-500/15 to-purple-500/5 border-purple-500/30",
  gold: "from-yellow-500/15 to-yellow-500/5 border-yellow-500/30",
  green: "from-green-500/15 to-green-500/5 border-green-500/30",
};
const tierText: Record<string, string> = {
  orange: "text-orange-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  gold: "text-yellow-400",
  green: "text-green-400",
};

export default function MembershipsPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<"tiers" | "members" | "billing">("tiers");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Tier | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", provider: "claude",
    monthlyAmount: "10", perks: [""], color: "orange", emoji: "⭐",
  });
  const [loading, setLoading] = useState(false);

  const loadTiers = () =>
    fetch("/api/memberships")
      .then(r => r.json())
      .then(d => setTiers(Array.isArray(d) ? d : []));

  const loadSubscribers = () =>
    fetch("/api/subscriptions")
      .then(r => r.json())
      .then(d => setSubscribers(Array.isArray(d.received) ? d.received : []));

  useEffect(() => { loadTiers(); loadSubscribers(); }, []);

  const resetForm = () =>
    setForm({ name: "", description: "", provider: "claude", monthlyAmount: "10", perks: [""], color: "orange", emoji: "⭐" });

  const save = async () => {
    if (!form.name.trim()) { toast.error("Tier name required"); return; }
    const perks = form.perks.filter(p => p.trim());
    setLoading(true);
    try {
      const url = editing ? `/api/memberships/${editing.id}` : "/api/memberships";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, monthlyAmount: parseFloat(form.monthlyAmount), perks }),
      });
      if (res.ok) {
        toast.success(editing ? "Tier updated" : "Tier created!");
        setEditing(null); setCreating(false); resetForm(); loadTiers();
      } else {
        const d = await res.json(); toast.error(d.error || "Failed");
      }
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    await fetch(`/api/memberships/${id}`, { method: "DELETE" });
    toast.success("Tier removed"); loadTiers();
  };

  const startEdit = (t: Tier) => {
    setEditing(t); setCreating(false);
    setForm({
      name: t.name, description: t.description || "",
      provider: t.provider, monthlyAmount: String(t.monthlyAmount),
      perks: t.perks.length ? t.perks : [""], color: t.color, emoji: t.emoji,
    });
    setActiveTab("tiers");
  };

  const totalMRR = subscribers.reduce((sum, s) => sum + s.amount, 0);
  const memberCount = subscribers.length;

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Memberships</h1>
          <p className="text-zinc-500 text-sm mt-1">Monthly recurring subscriptions paid in AI tokens</p>
        </div>
        {activeTab === "tiers" && (
          <Button size="sm" onClick={() => { setCreating(true); setEditing(null); resetForm(); }}>+ New Tier</Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 my-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold font-mono text-orange-400">{memberCount}</div>
          <div className="text-xs text-zinc-500 mt-1">Active members</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold font-mono text-green-400">{totalMRR.toFixed(1)}M</div>
          <div className="text-xs text-zinc-500 mt-1">Tokens/month</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
          <div className="text-2xl font-bold font-mono text-blue-400">{tiers.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Tiers</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-zinc-800/50 border border-zinc-800 mb-6 w-fit">
        {(["tiers", "members", "billing"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            {tab === "members" ? `Members ${memberCount > 0 ? `(${memberCount})` : ""}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TIERS TAB */}
      {activeTab === "tiers" && (
        <>
          {(creating || editing) && (
            <Card className="mb-6 border-orange-500/30 bg-zinc-900">
              <CardHeader><CardTitle className="text-sm">{editing ? "Edit Tier" : "New Membership Tier"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Tier name</label>
                    <Input placeholder="e.g. Supporter, Patron, VIP" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Monthly cost (M tokens)</label>
                    <Input type="number" placeholder="10" value={form.monthlyAmount} onChange={e => setForm(f => ({ ...f, monthlyAmount: e.target.value }))} min="0.1" step="0.1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Description</label>
                  <Input placeholder="What do members get?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Payment provider</label>
                  <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100">
                    {ALL_PROVIDERS.map(p => <option key={p} value={p}>{providerLabel(p)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-2">Perks</label>
                  {form.perks.map((perk, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input placeholder={`Perk ${i + 1}`} value={perk} onChange={e => {
                        const p = [...form.perks]; p[i] = e.target.value; setForm(f => ({ ...f, perks: p }));
                      }} />
                      {form.perks.length > 1 && (
                        <Button size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, perks: f.perks.filter((_, j) => j !== i) }))}>×</Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, perks: [...f.perks, ""] }))}>+ Add perk</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-2">Color</label>
                    <div className="flex gap-2">
                      {COLORS.map(c => (
                        <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, color: c.value }))} className={`w-8 h-8 rounded-full ${c.cls} ${form.color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""}`} title={c.label} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-2">Emoji</label>
                    <div className="flex gap-1 flex-wrap">
                      {EMOJIS.map(e => (
                        <button key={e} type="button" onClick={() => setForm(f => ({ ...f, emoji: e }))} className={`w-8 h-8 rounded text-lg flex items-center justify-center ${form.emoji === e ? "bg-orange-500/20 ring-1 ring-orange-500" : "bg-zinc-800"}`}>{e}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={save} disabled={loading}>{loading ? "Saving..." : editing ? "Save changes" : "Create tier"}</Button>
                  <Button variant="outline" onClick={() => { setEditing(null); setCreating(false); resetForm(); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tiers.length === 0 && !creating ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <div className="text-5xl mb-4">🎫</div>
              <h2 className="text-lg font-semibold mb-2">No tiers yet</h2>
              <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">Create membership tiers to let supporters pay you monthly in AI tokens and get exclusive access to content.</p>
              <Button onClick={() => setCreating(true)}>Create your first tier</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tiers.map(t => {
                const tierSubs = subscribers.filter(s => s.tierId === t.id);
                return (
                  <Card key={t.id} className={`bg-gradient-to-br ${tierBg[t.color] ?? tierBg.orange} border`}>
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{t.emoji}</span>
                          <div>
                            <div className={`font-bold ${tierText[t.color] ?? tierText.orange}`}>{t.name}</div>
                            <div className="text-xs text-zinc-500">{t.monthlyAmount}M {providerLabel(t.provider)}/mo</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => startEdit(t)}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-400 border-red-500/30" onClick={() => del(t.id)}>×</Button>
                        </div>
                      </div>
                      {t.description && <p className="text-xs text-zinc-400 mb-3">{t.description}</p>}
                      {t.perks.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {t.perks.map(p => (
                            <li key={p} className="flex items-center gap-1.5 text-xs text-zinc-300">
                              <span className={tierText[t.color] ?? tierText.orange}>✓</span> {p}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-700/50">
                        {tierSubs.length} member{tierSubs.length !== 1 ? "s" : ""}
                        {tierSubs.length > 0 && <span className="ml-2 text-green-400">· {(tierSubs.length * t.monthlyAmount).toFixed(1)}M tokens/mo</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
        <>
          {subscribers.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-lg font-semibold mb-2">No members yet</h2>
              <p className="text-zinc-500 text-sm">When supporters subscribe to your tiers, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {subscribers.map(sub => {
                const tier = tiers.find(t => t.id === sub.tierId);
                const name = sub.supporter.name ?? sub.supporter.username ?? "Anonymous";
                return (
                  <div key={sub.id} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                    <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 flex-shrink-0">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{name}</div>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {tier && <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">{tier.emoji} {tier.name}</span>}
                        <span className="text-xs text-zinc-500">since {fmt(sub.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-mono font-medium text-orange-400">{sub.amount.toFixed(1)}M</div>
                      <div className="text-xs text-zinc-500">{providerLabel(sub.provider)}/mo</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* BILLING TAB */}
      {activeTab === "billing" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Monthly Recurring Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4 text-center">No active subscriptions yet.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {subscribers.map(sub => {
                      const tier = tiers.find(t => t.id === sub.tierId);
                      const name = sub.supporter.name ?? sub.supporter.username ?? "Anonymous";
                      return (
                        <div key={sub.id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800 last:border-0">
                          <div>
                            <span className="font-medium">{name}</span>
                            {tier && <span className="ml-2 text-xs text-zinc-500">{tier.emoji} {tier.name}</span>}
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-orange-400">{sub.amount.toFixed(1)}M {providerLabel(sub.provider)}</div>
                            <div className="text-xs text-zinc-500">
                              {sub.nextBillAt ? <>Next: {fmt(sub.nextBillAt)}</> : "Active"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
                    <span className="text-sm text-zinc-400 font-medium">Total MRR</span>
                    <span className="text-lg font-bold font-mono text-green-400">{totalMRR.toFixed(1)}M tokens/mo</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">About Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p>Members pay monthly in AI tokens from their wallet. Payments are transferred immediately when they subscribe.</p>
              <p>Renewal billing happens automatically each month on the subscriber's anniversary date.</p>
              <p>If a subscriber doesn't have enough tokens when renewal is due, their membership is paused until they top up.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
