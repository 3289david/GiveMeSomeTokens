"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PLAN_FEATURES, PLAN_PRICES, planLabel, type Plan } from "@/lib/plan";

export default function PlanPage() {
  const [currentPlan, setCurrentPlan] = useState<Plan>("free");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<Plan | null>(null);

  useEffect(() => {
    fetch("/api/plan").then(r => r.json()).then(d => {
      setCurrentPlan(d.plan ?? "free");
      setPlanExpiresAt(d.planExpiresAt);
    });
  }, []);

  const upgrade = async (plan: Plan) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const d = await res.json();
      if (res.ok) {
        setCurrentPlan(d.plan);
        toast.success(`Switched to ${planLabel(d.plan)} plan`);
      } else {
        toast.error(d.error || "Failed to update plan");
      }
    } finally {
      setLoading(null);
    }
  };

  const plans: { key: Plan; name: string; price: string; highlight: boolean; desc: string }[] = [
    { key: "free", name: "Free", price: "$0/mo", highlight: false, desc: "5% platform fee on received tokens" },
    { key: "pro", name: "Pro", price: "$9/mo", highlight: true, desc: "1% platform fee — for serious creators" },
    { key: "team", name: "Team", price: "$29/mo", highlight: false, desc: "0% platform fee — for teams and studios" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Plan & Billing</h1>
      <p className="text-zinc-500 text-sm mb-2">
        Current plan: <span className="font-semibold text-zinc-200">{planLabel(currentPlan)}</span>
        {planExpiresAt && <span className="ml-2 text-xs text-zinc-600">Renews {new Date(planExpiresAt).toLocaleDateString()}</span>}
      </p>
      <p className="text-zinc-600 text-xs mb-8">Payment integration coming soon — upgrades are currently in demo mode.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {plans.map(({ key, name, price, highlight, desc }) => (
          <Card key={key} className={`relative ${highlight ? "border-orange-500/50" : ""} ${currentPlan === key ? "ring-2 ring-orange-500/40" : ""}`}>
            {highlight && (
              <div className="text-center text-xs font-semibold text-orange-400 bg-orange-500/10 py-1.5 rounded-t-xl border-b border-orange-500/30">
                Most Popular
              </div>
            )}
            {currentPlan === key && (
              <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                Current
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
              <div className="text-2xl font-bold">{price}</div>
              <p className="text-xs text-zinc-500">{desc}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 mb-5">
                {PLAN_FEATURES[key].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                    <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {currentPlan === key ? (
                <Button className="w-full" disabled variant="outline">Current plan</Button>
              ) : (
                <Button
                  className="w-full"
                  variant={highlight ? "default" : "outline"}
                  disabled={loading === key}
                  onClick={() => upgrade(key)}
                >
                  {loading === key ? "Switching..." : key === "free" ? "Downgrade to Free" : `Upgrade to ${name}`}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="font-semibold text-sm mb-3">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-2 font-medium text-zinc-400 w-1/2">Feature</th>
                <th className="pb-2 font-medium text-zinc-400 text-center">Free</th>
                <th className="pb-2 font-medium text-orange-400 text-center">Pro</th>
                <th className="pb-2 font-medium text-zinc-400 text-center">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {[
                ["Platform fee", "5%", "1%", "0%"],
                ["All 14 AI providers", "✓", "✓", "✓"],
                ["GMT API proxy", "✓", "✓", "✓"],
                ["Goals & projects", "✓", "✓", "✓"],
                ["Advanced analytics", "—", "✓", "✓"],
                ["GMT Connect OAuth apps", "—", "✓", "✓"],
                ["Subscription tiers", "—", "✓", "✓"],
                ["Pro badge on profile", "—", "✓", "✓"],
                ["Team token pooling", "—", "—", "✓"],
                ["Shared wallet", "—", "—", "✓"],
                ["Up to 10 team members", "—", "—", "✓"],
                ["SLA support", "—", "—", "✓"],
              ].map(([feature, free, pro, team]) => (
                <tr key={feature}>
                  <td className="py-2 text-zinc-400">{feature}</td>
                  <td className="py-2 text-center text-zinc-500">{free}</td>
                  <td className="py-2 text-center text-orange-400 font-medium">{pro}</td>
                  <td className="py-2 text-center text-zinc-400">{team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
