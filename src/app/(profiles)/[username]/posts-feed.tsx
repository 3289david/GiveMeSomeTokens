"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MembershipTier {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

interface Post {
  id: string;
  title: string;
  content: string | null;
  excerpt?: string | null;
  isPublic: boolean;
  isPinned: boolean;
  locked: boolean;
  tierId?: string | null;
  createdAt: string;
  memberTier?: MembershipTier | null;
}

interface PostsFeedProps {
  posts: Post[];
}

const tierText: Record<string, string> = {
  orange: "text-orange-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  gold: "text-yellow-400",
  green: "text-green-400",
};

export default function PostsFeed({ posts }: PostsFeedProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (posts.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-300 mb-3">Posts</h2>
      <div className="space-y-3">
        {posts.map(p => (
          <Card key={p.id} className={p.isPinned ? "border-orange-500/30" : ""}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {p.isPinned && <span className="text-xs text-orange-400">Pinned</span>}
                {p.memberTier && (
                  <span className={`text-xs px-1.5 py-0.5 rounded bg-zinc-800 ${tierText[p.memberTier.color] ?? "text-zinc-400"}`}>
                    {p.memberTier.emoji} {p.memberTier.name}
                  </span>
                )}
                {!p.isPublic && !p.memberTier && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Members</span>
                )}
                {p.isPublic && <span className="text-xs text-green-500">Public</span>}
              </div>
              <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
              {p.locked ? (
                <div className="mt-2">
                  {p.excerpt && (
                    <p className="text-xs text-zinc-400 mb-2">{p.excerpt}</p>
                  )}
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-center">
                    <p className="text-xs text-zinc-500">
                      {p.memberTier
                        ? `Subscribe to ${p.memberTier.emoji} ${p.memberTier.name} to read this post`
                        : "Become a member to read this post"}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {p.content && (
                    <div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {expanded[p.id] ? p.content : p.content.slice(0, 200)}
                        {p.content.length > 200 && !expanded[p.id] && "..."}
                      </p>
                      {p.content.length > 200 && (
                        <button
                          onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
                          className="text-xs text-orange-400 hover:text-orange-300 mt-1"
                        >
                          {expanded[p.id] ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-zinc-600 mt-2">
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
