"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", bio: "", website: "", github: "", twitter: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.user) setForm({ name: d.user.name ?? "", bio: d.user.bio ?? "", website: d.user.website ?? "", github: d.user.github ?? "", twitter: d.user.twitter ?? "" });
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) toast.success("Profile saved");
      else { const d = await res.json(); toast.error(d.error); }
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Profile</h1>
      <p className="text-zinc-500 text-sm mb-8">Edit your public profile.</p>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={save} className="space-y-4">
            <div><label className="block text-sm text-zinc-400 mb-1">Display name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="block text-sm text-zinc-400 mb-1">Bio</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none" rows={3} /></div>
            <div><label className="block text-sm text-zinc-400 mb-1">Website</label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yoursite.com" /></div>
            <div><label className="block text-sm text-zinc-400 mb-1">GitHub username</label><Input value={form.github} onChange={e => setForm(f => ({ ...f, github: e.target.value }))} placeholder="username" /></div>
            <div><label className="block text-sm text-zinc-400 mb-1">X (Twitter) username</label><Input value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))} placeholder="username" /></div>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save profile"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
