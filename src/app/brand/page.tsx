import { Nav } from "@/components/nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand",
  description: "GiveMeSomeTokens brand assets, logos, and press kit.",
};

const ASSETS = [
  {
    file: "/brand/logomark.svg",
    name: "Logomark — Gradient",
    desc: "Primary mark. Use on dark or neutral backgrounds.",
    bg: "bg-zinc-900",
  },
  {
    file: "/brand/logomark-white.svg",
    name: "Logomark — White",
    desc: "For colored or very dark backgrounds.",
    bg: "bg-zinc-800",
  },
  {
    file: "/brand/logomark-black.svg",
    name: "Logomark — Black",
    desc: "For light or white backgrounds.",
    bg: "bg-zinc-100",
  },
  {
    file: "/brand/logo-full-dark.svg",
    name: "Logo — Full (Dark)",
    desc: "Logomark + wordmark. For dark backgrounds.",
    bg: "bg-zinc-900",
    wide: true,
  },
  {
    file: "/brand/logo-full-light.svg",
    name: "Logo — Full (Light)",
    desc: "Logomark + wordmark. For light backgrounds.",
    bg: "bg-zinc-100",
    wide: true,
  },
  {
    file: "/brand/wordmark-gradient.svg",
    name: "Wordmark",
    desc: "Gradient wordmark only. Minimum width 200px.",
    bg: "bg-zinc-900",
    wide: true,
  },
  {
    file: "/brand/colors.svg",
    name: "Brand Colors",
    desc: "Orange #f97316 · Purple #a855f7 · Blue #3b82f6",
    bg: "bg-zinc-950",
    wide: true,
  },
];

const COLORS = [
  { name: "Brand Orange", hex: "#f97316", tw: "orange-500", bg: "bg-orange-500" },
  { name: "Brand Purple", hex: "#a855f7", tw: "purple-500", bg: "bg-purple-500" },
  { name: "Brand Blue",   hex: "#3b82f6", tw: "blue-500",   bg: "bg-blue-500" },
  { name: "Background",  hex: "#09090b", tw: "zinc-950",   bg: "bg-zinc-900 border border-zinc-700" },
  { name: "Surface",     hex: "#18181b", tw: "zinc-900",   bg: "bg-zinc-800 border border-zinc-700" },
  { name: "Muted",       hex: "#71717a", tw: "zinc-500",   bg: "bg-zinc-500" },
];

export default function BrandPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="inline-block rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 mb-4">
            Press Kit
          </div>
          <h1 className="text-3xl font-bold mb-3">Brand Assets</h1>
          <p className="text-zinc-400 max-w-xl">
            Download and use these assets when writing about GiveMeSomeTokens. Please follow the usage guidelines.
          </p>
        </div>

        {/* Usage guidelines */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-semibold text-green-400 mb-2">Do</div>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>Use the provided SVG files</li>
              <li>Maintain clear space around the logo</li>
              <li>Use on appropriate backgrounds</li>
              <li>Link to givemesometokens.dev</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-red-400 mb-2">Do not</div>
            <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
              <li>Modify the gradient colors</li>
              <li>Stretch or distort the logo</li>
              <li>Add effects or shadows</li>
              <li>Use on clashing backgrounds</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-300 mb-2">Name</div>
            <p className="text-sm text-zinc-400">
              Always written as <span className="font-semibold text-zinc-200">GiveMeSomeTokens</span> — one word, capital G/M/S/T. Never &quot;Give Me Some Tokens&quot; or &quot;GMST&quot;.
            </p>
          </div>
        </div>

        {/* Logo assets */}
        <h2 className="text-lg font-semibold mb-4">Logos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {ASSETS.map((a) => (
            <div key={a.file} className={`rounded-xl border border-zinc-800 overflow-hidden ${a.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
              <div className={`${a.bg} flex items-center justify-center p-8 ${a.wide ? "h-32" : "h-40"}`}>
                <img
                  src={a.file}
                  alt={a.name}
                  className={a.wide ? "h-16 max-w-full" : "h-16 w-16"}
                />
              </div>
              <div className="bg-zinc-900 p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{a.desc}</div>
                </div>
                <a
                  href={a.file}
                  download
                  className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  SVG
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Colors */}
        <h2 className="text-lg font-semibold mb-4">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {COLORS.map((c) => (
            <div key={c.hex} className="rounded-xl border border-zinc-800 overflow-hidden">
              <div className={`${c.bg} h-20`} />
              <div className="bg-zinc-900 p-3">
                <div className="text-xs font-semibold">{c.name}</div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">{c.hex}</div>
                <div className="text-xs text-zinc-600 font-mono">{c.tw}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient */}
        <h2 className="text-lg font-semibold mb-4">Brand Gradient</h2>
        <div className="rounded-xl overflow-hidden border border-zinc-800 mb-10">
          <div className="h-20 gmt-gradient" />
          <div className="bg-zinc-900 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 text-xs mb-1">CSS</div>
              <code className="text-xs text-zinc-300 font-mono">linear-gradient(135deg, #f97316, #a855f7, #3b82f6)</code>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Tailwind</div>
              <code className="text-xs text-zinc-300 font-mono">from-orange-500 via-purple-500 to-blue-500</code>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Direction</div>
              <code className="text-xs text-zinc-300 font-mono">135deg (top-left → bottom-right)</code>
            </div>
          </div>
        </div>

        {/* Typography */}
        <h2 className="text-lg font-semibold mb-4">Typography</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div>
            <div className="text-xs text-zinc-500 mb-2">Display / Headings</div>
            <div className="text-3xl font-bold">GiveMeSomeTokens</div>
            <div className="text-xs text-zinc-600 mt-1">Inter 800 — system-ui fallback</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-2">Body</div>
            <div className="text-base text-zinc-300">Support creators with AI tokens instead of money.</div>
            <div className="text-xs text-zinc-600 mt-1">Inter 400 — system-ui fallback</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-2">Monospace (token amounts)</div>
            <div className="text-2xl font-bold font-mono gmt-gradient-text">128.5M</div>
            <div className="text-xs text-zinc-600 mt-1">Font-mono with brand gradient</div>
          </div>
        </div>
      </div>
    </div>
  );
}
