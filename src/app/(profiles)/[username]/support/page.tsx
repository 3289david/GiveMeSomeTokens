"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, GroqIcon,
  XAIIcon, MistralIcon, DeepSeekIcon, CohereIcon, PerplexityIcon,
  TogetherIcon, FireworksIcon, CerebrasIcon, AI21Icon, FuelIcon,
} from "@/components/icons";
import { formatTokens, ALL_PROVIDERS, providerLabel, type Provider } from "@/lib/utils";
import { toast } from "sonner";

const ICON_MAP: Record<Provider, React.ComponentType<{ className?: string }>> = {
  claude: ClaudeIcon, openai: OpenAIIcon, gemini: GeminiIcon,
  openrouter: OpenRouterIcon, groq: GroqIcon, xai: XAIIcon,
  mistral: MistralIcon, deepseek: DeepSeekIcon, cohere: CohereIcon,
  perplexity: PerplexityIcon, together: TogetherIcon, fireworks: FireworksIcon,
  cerebras: CerebrasIcon, ai21: AI21Icon,
};

const COLOR_MAP: Record<Provider, string> = {
  claude: "border-orange-500 bg-orange-500/10 text-orange-400",
  openai: "border-green-500 bg-green-500/10 text-green-400",
  gemini: "border-blue-500 bg-blue-500/10 text-blue-400",
  openrouter: "border-purple-500 bg-purple-500/10 text-purple-400",
  groq: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
  xai: "border-zinc-400 bg-zinc-400/10 text-zinc-200",
  mistral: "border-rose-500 bg-rose-500/10 text-rose-400",
  deepseek: "border-sky-500 bg-sky-500/10 text-sky-400",
  cohere: "border-teal-500 bg-teal-500/10 text-teal-400",
  perplexity: "border-indigo-500 bg-indigo-500/10 text-indigo-400",
  together: "border-pink-500 bg-pink-500/10 text-pink-400",
  fireworks: "border-amber-500 bg-amber-500/10 text-amber-400",
  cerebras: "border-red-500 bg-red-500/10 text-red-400",
  ai21: "border-cyan-500 bg-cyan-500/10 text-cyan-400",
};

const AMOUNTS = [1, 5, 10, 50];

export default function SupportPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [provider, setProvider] = useState<Provider>("claude");
  const [amount, setAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [creatorName, setCreatorName] = useState(username);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setCreatorName(d.name);
        if (d.projects) setProjects(d.projects);
      });
  }, [username]);

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=/@${username}/support`);
      return;
    }
    if (!finalAmount || finalAmount <= 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorUsername: username,
          provider,
          amount: finalAmount,
          message: message.trim() || undefined,
          isAnonymous,
          projectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send support");
        return;
      }
      toast.success(`Sent ${formatTokens(finalAmount)} ${providerLabel(provider)} tokens!`);
      router.push(`/@${username}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 py-10 px-4">
        <div className="max-w-lg mx-auto">
          <Link href={`/@${username}`} className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 block">
            Back to @{username}
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <FuelIcon className="w-6 h-6 text-orange-400" />
            <div>
              <h1 className="text-xl font-bold">Fuel {creatorName}</h1>
              <p className="text-sm text-zinc-500">Send AI tokens instead of money</p>
            </div>
          </div>
          <Card className="border-orange-500/30">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="text-4xl mb-4">🔑</div>
              <h2 className="text-lg font-semibold mb-2">Sign in to send tokens</h2>
              <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
                Create a free account, connect your AI provider key, and fuel {creatorName} with tokens.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href={`/login?mode=register&callbackUrl=/@${username}/support`}>Create free account</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/login?callbackUrl=/@${username}/support`}>Sign in</Link>
                </Button>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 space-y-2 text-left max-w-xs mx-auto">
                {["Connect your Claude, OpenAI, or any of 14 provider keys", "Tokens go straight into the creator's AI wallet", "No middleman — your key stays encrypted"].map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-zinc-500">
                    <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <Link href={`/@${username}`} className="text-sm text-zinc-500 hover:text-zinc-300 mb-6 block">
          Back to @{username}
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <FuelIcon className="w-6 h-6 text-orange-400" />
          <div>
            <h1 className="text-xl font-bold">Fuel {creatorName}</h1>
            <p className="text-sm text-zinc-500">Send AI tokens instead of money</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Choose provider</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PROVIDERS.map((key) => {
                  const Icon = ICON_MAP[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setProvider(key)}
                      className={`flex items-center gap-2 rounded-lg border p-3 transition-colors text-sm font-medium ${
                        provider === key ? COLOR_MAP[key] : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="truncate">{providerLabel(key)}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Amount (millions of tokens)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`rounded-lg border py-2 text-sm font-mono font-semibold transition-colors ${
                      amount === a && !customAmount
                        ? "border-orange-500 bg-orange-500/10 text-orange-400"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {a}M
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount (M)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                min="0.001"
                step="0.001"
              />
            </CardContent>
          </Card>

          {/* Project */}
          {projects.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Support a specific project (optional)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectId(undefined)}
                    className={`rounded-lg border p-2 text-sm transition-colors ${!projectId ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
                  >
                    General support
                  </button>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProjectId(p.id)}
                      className={`rounded-lg border p-2 text-sm transition-colors ${projectId === p.id ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Message (optional)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <textarea
                placeholder={`Say something nice to ${creatorName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-zinc-600"
                />
                Send anonymously
              </label>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            variant="gradient"
            className="w-full"
            disabled={loading || !finalAmount}
          >
            {loading ? "Sending..." : `Send ${finalAmount ? formatTokens(finalAmount) : "?"} ${providerLabel(provider)} tokens`}
          </Button>

        </form>
      </div>
    </div>
  );
}
