"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60}      // Re-check session every 5 min in background
      refetchOnWindowFocus={false}   // Don't refetch just because user switched tabs
    >
      {children}
    </NextAuthSessionProvider>
  );
}
