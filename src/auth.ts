import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // Database sessions: persisted in DB, survive browser restarts
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,   // 30 days before requiring re-login
    updateAge: 24 * 60 * 60,      // Refresh DB timestamp once per day
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { prompt: "select_account", access_type: "offline" },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // maxAge keeps cookie alive across browser restarts for 30 days
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const u = user as typeof user & { username?: string | null; isCreator?: boolean; plan?: string };
        (session.user as typeof session.user & { username?: string | null }).username = u.username;
        (session.user as typeof session.user & { isCreator?: boolean }).isCreator = u.isCreator;
        (session.user as typeof session.user & { plan?: string }).plan = u.plan ?? "free";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Only allow relative URLs and same-origin redirects
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
});
