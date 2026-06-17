"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudeIcon, OpenAIIcon, GeminiIcon, OpenRouterIcon, FuelIcon } from "@/components/icons";
import { formatTokens } from "@/lib/utils";
import { toast } from "sonner";

const PROVIDERS = [
  { key: "claude", label: "Claude", Icon: ClaudeIcon, color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { key: "openai", label: "GPT", Icon: OpenAIIcon, color: "border-green-500 bg-green-500/10 text-green-400" },
  { key: "gemini", label: "Gemini", Icon: GeminiIcon, color: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { key: "openrouter", label: "OpenRouter", Icon: OpenRouterIcon, color: "border-purple-500 bg-purple-500/10 text-purple-400" },
];

const AMOUNTS = [1, 5, 10, 50];

export default function SupportPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [provider, setProvider] = useState("claude");
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
      toast.success(`Sent ${formatTokens(finalAmount)} ${provider === "claude" ? "Claude" : provider === "openai" ? "GPT" : provider === "gemini" ? "Gemini" : "OpenRouter"} tokens!`);
      router.push(`/@${username}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return null;

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
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(({ key, label, Icon, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProvider(key)}
                    className={`flex items-center gap-2 rounded-lg border p-3 transition-colors text-sm font-medium ${
                      provider === key ? color : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
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
            {loading ? "Sending..." : `Send ${finalAmount ? formatTokens(finalAmount) : "?"} ${provider === "claude" ? "Claude" : provider === "openai" ? "GPT" : provider === "gemini" ? "Gemini" : "OpenRouter"} tokens`}
          </Button>

          {!session && (
            <p className="text-center text-sm text-zinc-500">
              You need to{" "}
              <Link href="/login" className="text-orange-400 hover:underline">sign in</Link>
              {" "}to send tokens
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
