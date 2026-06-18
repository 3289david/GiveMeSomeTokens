"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ALL_PROVIDERS, providerLabel } from "@/lib/utils";

export default function TokenTopup() {
  const [provider, setProvider] = useState("claude");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, amount: parseFloat(amount) }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(`Added ${amount}M ${provider} tokens`);
        setAmount("");
      } else {
        toast.error(d.error || "Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Add Tokens to Wallet</CardTitle></CardHeader>
      <CardContent>
        <p className="text-xs text-zinc-500 mb-4">Add tokens to your wallet — this represents tokens you can send to creators.</p>
        <form onSubmit={handleTopup} className="flex gap-2 flex-wrap">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100"
          >
            {ALL_PROVIDERS.map(p => <option key={p} value={p}>{providerLabel(p)}</option>)}
          </select>
          <Input
            type="number"
            placeholder="Amount (M)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-36"
            min="0.001"
            step="0.001"
          />
          <Button type="submit" disabled={loading || !amount}>
            {loading ? "Adding..." : "Add tokens"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
