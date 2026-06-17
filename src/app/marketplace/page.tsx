"use client";
import { useState, useEffect } from "react";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTokens, providerLabel } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

const TYPES = ["All", "Prompt Pack", "Agent", "Workflow", "MCP Server", "Template"];

interface Item {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  priceProvider: string;
  creatorId: string;
}

export default function MarketplacePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace")
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? items : items.filter(i => i.type === filter);

  const purchase = async (itemId: string) => {
    const res = await fetch("/api/marketplace/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const d = await res.json();
    if (res.ok) toast.success("Purchased!");
    else toast.error(d.error || "Failed");
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-zinc-500 mt-1">Buy and sell AI tools with tokens, not dollars</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard/marketplace/new">List an item</Link>
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                filter === t ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg mb-4">No items yet</p>
            <Button asChild>
              <Link href="/dashboard/marketplace/new">List the first item</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Card key={item.id} className="hover:border-zinc-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">{item.name}</CardTitle>
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">{item.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold font-mono">{formatTokens(item.price)}</div>
                      <div className="text-xs text-zinc-500">{providerLabel(item.priceProvider)} tokens</div>
                    </div>
                    <Button size="sm" onClick={() => purchase(item.id)}>Buy</Button>
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
