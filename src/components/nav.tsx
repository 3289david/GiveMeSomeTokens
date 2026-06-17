import { auth } from "@/auth";
import { NavClient } from "./nav-client";

export async function Nav() {
  const session = await auth();
  const user = session?.user as ({ username?: string | null } & Record<string, unknown>) | undefined;

  return (
    <NavClient
      isLoggedIn={!!session?.user}
      username={user?.username}
    />
  );
}
