"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GmtLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // If user already has a username, skip onboarding
  useEffect(() => {
    const user = session?.user as ({ username?: string | null } & Record<string, unknown>) | undefined;
    if (user?.username) {
      router.replace("/dashboard");
    }
  }, [session, router]);
  const [username, setUsername] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), isCreator }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      await update();
      router.push(isCreator ? "/dashboard" : "/explore");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <GmtLogo className="w-10 h-10 mb-4" />
          <h1 className="text-2xl font-bold text-zinc-100">Set up your profile</h1>
          <p className="text-zinc-500 text-sm mt-1">Choose a username to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Username</label>
            <div className="flex items-center gap-0">
              <span className="flex items-center h-9 px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-500 text-sm">
                givemesometokens.dev/@
              </span>
              <Input
                className="rounded-l-none"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                maxLength={32}
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCreator(false)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  !isCreator
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div className="font-medium text-sm mb-1 text-zinc-100">Support creators</div>
                <div className="text-xs text-zinc-500">Send AI tokens to creators I love</div>
              </button>
              <button
                type="button"
                onClick={() => setIsCreator(true)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  isCreator
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div className="font-medium text-sm mb-1 text-zinc-100">Receive tokens</div>
                <div className="text-xs text-zinc-500">Get AI credits from my supporters</div>
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !username}>
            {loading ? "Setting up..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
