import "./admin.css";
import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/server/auth";
import { AdminProvider } from "@/lib/admin/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoginCheck } from "@/components/admin/LoginCheck";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await getSessionEmail();
  // The Admin panel is restricted to authorized admin users (Neon-backed session).
  if (!email) redirect("/login");
  return (
    <div className="admin-body">
      <AdminProvider>
        <LoginCheck />
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </div>
  );
}
