"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { providerLabel } from "@/lib/utils";

interface MembershipTier {
  id: string;
  name: string;
  description?: string | null;
  provider: string;
  monthlyAmount: number;
  perks: string[];
  color: string;
  emoji: string;
}

interface MembershipSectionProps {
  tiers: MembershipTier[];
  creatorUsername: string;
  activeTierIds: string[];
}

const tierBg: Record<string, string> = {
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  gold: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
  green: "from-green-500/20 to-green-500/5 border-green-500/30",
};
const tierText: Record<string, string> = {
  orange: "text-orange-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  gold: "text-yellow-400",
  green: "text-green-400",
};
const tierBtn: Record<string, string> = {
  orange: "bg-orange-500 hover:bg-orange-600",
  blue: "bg-blue-500 hover:bg-blue-600",
  purple: "bg-purple-500 hover:bg-purple-600",
  gold: "bg-yellow-500 hover:bg-yellow-600",
  green: "bg-green-500 hover:bg-green-600",
};

export default function MembershipSection({ tiers, creatorUsername, activeTierIds }: MembershipSectionProps) {
  const [subscribing, setSubscribing] = useState<string | null>(null);

  if (tiers.length === 0) return null;

  const subscribe = async (tier: MembershipTier) => {
    setSubscribing(tier.id);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername,
          provider: tier.provider,
          amount: tier.monthlyAmount,
          tier: tier.name,
          tierId: tier.id,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        toast.success(`Subscribed to ${tier.name}!`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(d.error || "Failed to subscribe");
      }
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-300 mb-3">Membership Tiers</h2>
      <div className="space-y-3">
        {tiers.map(t => {
          const isActive = activeTierIds.includes(t.id);
          return (
            <div
              key={t.id}
              className={`rounded-xl border bg-gradient-to-br p-4 ${tierBg[t.color] ?? tierBg.orange}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                  <div className="min-w-0">
                    <div className={`font-bold text-sm ${tierText[t.color] ?? tierText.orange}`}>{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.monthlyAmount}M {providerLabel(t.provider)}/month</div>
                  </div>
                </div>
                {isActive ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex-shrink-0">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => subscribe(t)}
                    disabled={subscribing === t.id}
                    className={`text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-colors flex-shrink-0 disabled:opacity-50 ${tierBtn[t.color] ?? tierBtn.orange}`}
                  >
                    {subscribing === t.id ? "..." : "Subscribe"}
                  </button>
                )}
              </div>
              {t.description && (
                <p className="text-xs text-zinc-400 mt-2">{t.description}</p>
              )}
              {t.perks.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <span className={tierText[t.color] ?? tierText.orange}>✓</span> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
