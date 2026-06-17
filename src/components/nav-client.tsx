"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GmtLogo } from "./icons";
import { Button } from "./ui/button";

interface NavClientProps {
  isLoggedIn: boolean;
  username?: string | null;
}

export function NavClient({ isLoggedIn, username }: NavClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/providers", label: "Providers" },
    { href: "/pricing", label: "Pricing" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0" onClick={() => setOpen(false)}>
            <GmtLogo className="w-8 h-8" />
            <span className="font-semibold text-zinc-100 hidden sm:block">GiveMeSomeTokens</span>
            <span className="font-semibold text-zinc-100 sm:hidden">GMT</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors ${pathname === l.href ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-100"}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href="/wallet" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Wallet</Link>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/login?mode=register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn && (
              <Button asChild size="sm" variant="secondary" className="text-xs px-2.5">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === l.href
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-zinc-800 mt-3 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/wallet"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    Wallet
                  </Link>
                  {username && (
                    <Link
                      href={`/@${username}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                      My Profile
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login?mode=register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm bg-orange-500 text-white font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
