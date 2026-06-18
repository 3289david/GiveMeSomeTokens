"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { providerLabel } from "@/lib/utils";
import Link from "next/link";

const ITEM_TYPES = ["Prompt Pack", "Agent", "Workflow", "MCP Server", "Template"] as const;
const PROVIDERS = ["claude", "openai", "gemini", "openrouter", "groq"] as const;

interface ShopItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  price: number;
  priceProvider: string;
  content?: string;
  published: boolean;
  createdAt: string;
  _count: { purchases: number };
  purchases: { amount: number }[];
}

const emptyForm = {
  name: "",
  description: "",
  type: "Prompt Pack" as typeof ITEM_TYPES[number],
  price: "5",
  priceProvider: "claude" as typeof PROVIDERS[number],
  content: "",
};

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const load = () =>
    fetch("/api/marketplace?mine=true")
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d.items) ? d.items : []));

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      if (res.ok) {
        toast.success("Item listed in shop!");
        setCreating(false);
        setForm({ ...emptyForm });
        load();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to create");
      }
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    await fetch("/api/marketplace", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Item removed");
    load();
  };

  const totalRevenue = items.reduce((sum, item) =>
    sum + item.purchases.reduce((s, p) => s + p.amount, 0), 0);
  const totalSales = items.reduce((sum, item) => sum + item._count.purchases, 0);

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Shop</h1>
          <p className="text-zinc-500 text-sm mt-1">Sell AI tools, prompts, and templates for tokens</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/marketplace" target="_blank">View Marketplace ↗</Link>
          </Button>
          <Button size="sm" onClick={() => setCreating(!creating)}>+ Add Item</Button>
        </div>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="text-2xl font-bold font-mono text-orange-400">{items.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Listed items</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="text-2xl font-bold font-mono text-green-400">{totalSales}</div>
            <div className="text-xs text-zinc-500 mt-1">Total sales</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
            <div className="text-2xl font-bold font-mono text-blue-400">{totalRevenue.toFixed(1)}M</div>
            <div className="text-xs text-zinc-500 mt-1">Tokens earned</div>
          </div>
        </div>
      )}

      {/* Create form */}
      {creating && (
        <Card className="mb-6 border-orange-500/30 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-sm">New Shop Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Name</label>
                <Input
                  placeholder="e.g. Ultimate Coding Prompt Pack"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof ITEM_TYPES[number] }))}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100"
                >
                  {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Description</label>
              <Input
                placeholder="What's included? Who is it for?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Price (M tokens)</label>
                <Input
                  type="number"
                  placeholder="5"
                  min="0.1"
                  step="0.1"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Accept payment in</label>
                <select
                  value={form.priceProvider}
                  onChange={e => setForm(f => ({ ...f, priceProvider: e.target.value as typeof PROVIDERS[number] }))}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100"
                >
                  {PROVIDERS.map(p => <option key={p} value={p}>{providerLabel(p)} tokens</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Content (delivered after purchase)</label>
              <textarea
                placeholder="Paste your prompts, instructions, code, or any content here..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={5}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={loading}>{loading ? "Publishing..." : "Publish to Shop"}</Button>
              <Button variant="outline" onClick={() => { setCreating(false); setForm({ ...emptyForm }); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items list */}
      {items.length === 0 && !creating ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
          <div className="text-5xl mb-4">🛍️</div>
          <h2 className="text-lg font-semibold mb-2">Your shop is empty</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
            Sell prompt packs, AI agents, workflows, and templates for AI tokens. Buyers get instant access after purchase.
          </p>
          <Button onClick={() => setCreating(true)}>List your first item</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const revenue = item.purchases.reduce((s, p) => s + p.amount, 0);
            return (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">{item.type}</span>
                    {item.published && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">Live</span>}
                  </div>
                  {item.description && <p className="text-xs text-zinc-500 mt-1 truncate">{item.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                    <span className="text-orange-400 font-mono font-medium">{item.price}M {providerLabel(item.priceProvider)}</span>
                    <span>{item._count.purchases} {item._count.purchases === 1 ? "sale" : "sales"}</span>
                    {revenue > 0 && <span className="text-green-400">{revenue.toFixed(1)}M earned</span>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 flex-shrink-0"
                  onClick={() => del(item.id)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
