import "./admin.css";
import { AdminProvider } from "@/lib/admin/store";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-body">
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </div>
  );
}
