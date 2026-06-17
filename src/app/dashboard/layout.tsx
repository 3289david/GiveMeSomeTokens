import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as typeof session.user & { username?: string | null; plan?: string };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <DashboardSidebar email={session.user.email ?? ""} username={user.username} plan={user.plan} />

      {/* Main content — full width, with mobile top bar offset */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
