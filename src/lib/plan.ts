export type Plan = "free" | "pro" | "team";

export const PLAN_FEATURES: Record<Plan, string[]> = {
  free: [
    "Unlimited token receives",
    "All 14 AI providers",
    "Public creator profile",
    "Goals and projects",
    "GMT API key",
    "OpenAI-compatible proxy",
  ],
  pro: [
    "Everything in Free",
    "1% platform fee (vs 5%)",
    "Priority token routing",
    "Advanced analytics",
    "GMT Connect OAuth apps",
    "Subscription tiers",
    "Custom Pro badge",
    "Priority support",
  ],
  team: [
    "Everything in Pro",
    "0% platform fee",
    "Team token pooling",
    "Shared wallet (up to 10 members)",
    "Team analytics dashboard",
    "Invoicing and billing",
    "SLA support",
  ],
};

export const PLAN_PRICES: Record<Plan, string> = {
  free: "$0",
  pro: "$9/mo",
  team: "$29/mo",
};

export function isPro(plan: string | undefined | null): boolean {
  return plan === "pro" || plan === "team";
}

export function isTeam(plan: string | undefined | null): boolean {
  return plan === "team";
}

export function planLabel(plan: string | undefined | null): string {
  if (plan === "pro") return "Pro";
  if (plan === "team") return "Team";
  return "Free";
}
