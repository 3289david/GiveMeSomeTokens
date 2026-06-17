"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Project { id: string; name: string; description: string | null; createdAt: string }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.projects ?? []));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || null }),
      });
      if (res.ok) { toast.success("Project created"); setName(""); setDesc(""); load(); }
      else { const d = await res.json(); toast.error(d.error); }
    } finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    load();
    toast.success("Project deleted");
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Projects</h1>
      <p className="text-zinc-500 text-sm mb-8">Supporters can target specific projects when sending tokens.</p>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-sm">Add Project</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <Input placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
            <Button type="submit" disabled={loading || !name}>Create project</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {projects.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4 pb-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="font-medium text-sm">{p.name}</div>
                {p.description && <div className="text-xs text-zinc-500 mt-0.5">{p.description}</div>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300">Delete</Button>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && <div className="text-center py-8 text-zinc-500 text-sm">No projects yet</div>}
      </div>
    </div>
  );
}
