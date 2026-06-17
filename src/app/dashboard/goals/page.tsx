"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTokens, providerLabel } from "@/lib/utils";
import { toast } from "sonner";

const PROVIDERS = ["claude", "openai", "gemini", "openrouter", "groq"];
interface Goal { id: string; provider: string; targetAmount: number; currentAmount: number; description: string | null; completed: boolean }

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [provider, setProvider] = useState("claude");
  const [target, setTarget] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/goals").then(r => r.json()).then(d => setGoals(d.goals ?? []));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, targetAmount: parseFloat(target), description: desc.trim() || null }),
      });
      if (res.ok) { toast.success("Goal created"); setTarget(""); setDesc(""); load(); }
      else { const d = await res.json(); toast.error(d.error); }
    } finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    load();
    toast.success("Goal deleted");
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Goals</h1>
      <p className="text-zinc-500 text-sm mb-8">Set token milestones shown on your profile with a progress bar.</p>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-sm">Add Goal</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <div className="flex gap-2">
              <select value={provider} onChange={e => setProvider(e.target.value)}
                className="h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100">
                {PROVIDERS.map(p => <option key={p} value={p}>{providerLabel(p)}</option>)}
              </select>
              <Input type="number" placeholder="Target amount (M)" value={target} onChange={e => setTarget(e.target.value)} className="flex-1" />
            </div>
            <Input placeholder="Goal description (e.g. Open source Cheap AI CLI)" value={desc} onChange={e => setDesc(e.target.value)} />
            <Button type="submit" disabled={loading || !target}>Create goal</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {goals.map(g => {
          const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          return (
            <Card key={g.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium">{g.description ?? "Goal"}</span>
                    {g.completed && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Completed</span>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(g.id)} className="text-red-400 hover:text-red-300">Delete</Button>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{providerLabel(g.provider)}</span>
                  <span>{formatTokens(g.currentAmount)} / {formatTokens(g.targetAmount)}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {goals.length === 0 && <div className="text-center py-8 text-zinc-500 text-sm">No goals yet</div>}
      </div>
    </div>
  );
}
