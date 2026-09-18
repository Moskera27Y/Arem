import "./admin.css";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { AdminProvider } from "@/lib/admin/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoginCheck } from "@/components/admin/LoginCheck";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }
  return (
    <div className="admin-body">
      <AdminProvider>
        <LoginCheck />
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </div>
  );
}
