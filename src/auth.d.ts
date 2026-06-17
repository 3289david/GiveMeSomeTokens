import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username?: string | null;
      isCreator?: boolean;
    };
  }

  interface User {
    username?: string | null;
    isCreator?: boolean;
  }
}
