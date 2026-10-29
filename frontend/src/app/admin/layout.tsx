import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav, AdminNavFallback } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | Faith Explorers" },
  robots: { index: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin container">
      <h1 className="admin__title">Admin</h1>
      <Suspense fallback={<AdminNavFallback />}>
        <AdminNav />
      </Suspense>
      {children}
    </div>
  );
}
