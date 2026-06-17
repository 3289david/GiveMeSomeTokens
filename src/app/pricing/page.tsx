import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    fee: "5% platform fee",
    features: [
      "Unlimited token receives",
      "All AI providers",
      "Public creator profile",
      "Goals and projects",
      "GMT API key",
      "OpenAI-compatible proxy",
    ],
    cta: "Get started",
    href: "/login?mode=register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    fee: "1% platform fee",
    features: [
      "Everything in Free",
      "Priority token routing",
      "Advanced analytics",
      "GMT Connect OAuth apps",
      "Subscription tiers for supporters",
      "Custom profile badge",
      "Priority support",
    ],
    cta: "Coming soon",
    href: "#",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    fee: "0% platform fee",
    features: [
      "Everything in Pro",
      "Team token pooling",
      "Shared wallet",
      "Multiple team members",
      "Invoicing and billing",
      "SLA support",
    ],
    cta: "Coming soon",
    href: "#",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple pricing</h1>
          <p className="text-zinc-400 text-lg">Free to start. We take a small cut on tokens received.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.highlight ? "border-orange-500/50" : ""}>
              {plan.highlight && (
                <div className="text-center text-xs font-semibold text-orange-400 bg-orange-500/10 py-1.5 rounded-t-xl border-b border-orange-500/30">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>
                <div className="text-xs text-zinc-500">{plan.fee}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                      <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild={plan.href !== "#"}
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  disabled={plan.href === "#"}
                >
                  {plan.href !== "#" ? <Link href={plan.href}>{plan.cta}</Link> : <span>{plan.cta}</span>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-lg font-semibold mb-4">Creator Tiers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { tier: "Bronze", threshold: "100M+", color: "text-amber-500" },
              { tier: "Silver", threshold: "1B+", color: "text-zinc-300" },
              { tier: "Gold", threshold: "10B+", color: "text-yellow-400" },
              { tier: "Platinum", threshold: "100B+", color: "text-cyan-400" },
            ].map(({ tier, threshold, color }) => (
              <div key={tier} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center">
                <div className={`text-lg font-bold ${color}`}>{tier}</div>
                <div className="text-xs text-zinc-500 mt-1">{threshold} tokens received</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
