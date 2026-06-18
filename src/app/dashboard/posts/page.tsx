"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface MembershipTier { id: string; name: string; emoji: string; color: string }
interface Post { id: string; title: string; content: string; excerpt?: string; isPublic: boolean; isPinned: boolean; tierId?: string; createdAt: string; memberTier?: MembershipTier }

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", isPublic: true, isPinned: false, tierId: "" });
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/posts?creatorId=me")
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setPosts(data) : setPosts([]));
    fetch("/api/memberships").then(r => r.json()).then(data => Array.isArray(data) ? setTiers(data) : setTiers([]));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title: "", content: "", excerpt: "", isPublic: true, isPinned: false, tierId: "" });

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content required"); return; }
    setLoading(true);
    try {
      const url = editing ? `/api/posts/${editing.id}` : "/api/posts";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tierId: form.tierId || null, isPublic: form.tierId ? false : form.isPublic }),
      });
      if (res.ok) {
        toast.success(editing ? "Post updated" : "Post published");
        setEditing(null); setCreating(false); resetForm(); load();
      } else {
        const d = await res.json(); toast.error(d.error || "Failed");
      }
    } finally { setLoading(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    toast.success("Post deleted"); load();
  };

  const startEdit = (p: Post) => {
    setEditing(p); setCreating(false);
    setForm({ title: p.title, content: p.content, excerpt: p.excerpt || "", isPublic: p.isPublic, isPinned: p.isPinned, tierId: p.tierId || "" });
  };

  const tierColor: Record<string, string> = {
    orange: "text-orange-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    gold: "text-yellow-400",
    green: "text-green-400",
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button onClick={() => { setCreating(true); setEditing(null); resetForm(); }} disabled={creating && !editing}>
          + New Post
        </Button>
      </div>
      <p className="text-zinc-500 text-sm mb-8">Share updates, tutorials, and exclusive content with your supporters.</p>

      {(creating || editing) && (
        <Card className="mb-6 border-orange-500/30">
          <CardHeader><CardTitle className="text-sm">{editing ? "Edit Post" : "New Post"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Post title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea
              placeholder="Write your post content... (Markdown supported)"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full min-h-[200px] rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y"
            />
            <Input placeholder="Short excerpt (shown as preview for locked posts)" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-2">Visibility</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isPublic: true, tierId: "" }))}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${form.isPublic && !form.tierId ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isPublic: false, tierId: "" }))}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${!form.isPublic && !form.tierId ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}
                  >
                    Members only
                  </button>
                </div>
              </div>
              {tiers.length > 0 && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-2">Restrict to tier (optional)</label>
                  <select
                    value={form.tierId}
                    onChange={e => setForm(f => ({ ...f, tierId: e.target.value, isPublic: e.target.value ? false : f.isPublic }))}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100"
                  >
                    <option value="">All members</option>
                    {tiers.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} className="rounded" />
              Pin this post to the top
            </label>
            <div className="flex gap-2">
              <Button onClick={save} disabled={loading}>{loading ? "Saving..." : editing ? "Save changes" : "Publish post"}</Button>
              <Button variant="outline" onClick={() => { setEditing(null); setCreating(false); resetForm(); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 && !creating ? (
        <div className="text-center py-16 text-zinc-500">
          <div className="text-4xl mb-3">&#9997;&#65039;</div>
          <p className="text-sm mb-4">No posts yet. Share updates with your supporters!</p>
          <Button onClick={() => { setCreating(true); resetForm(); }}>Write your first post</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <Card key={p.id} className={p.isPinned ? "border-orange-500/30" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {p.isPinned && <span className="text-xs text-orange-400">Pinned</span>}
                      {!p.isPublic && !p.memberTier && <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Members</span>}
                      {p.memberTier && (
                        <span className={`text-xs px-1.5 py-0.5 rounded bg-zinc-800 ${tierColor[p.memberTier.color] ?? "text-zinc-400"}`}>
                          {p.memberTier.emoji} {p.memberTier.name}
                        </span>
                      )}
                      {p.isPublic && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">Public</span>}
                    </div>
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{p.excerpt || p.content.slice(0, 100)}</p>
                    <div className="text-xs text-zinc-600 mt-2">{new Date(p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                    <Button size="sm" variant="outline" className="text-red-400 border-red-500/30" onClick={() => del(p.id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
