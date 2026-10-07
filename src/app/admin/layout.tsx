import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell><div className="min-w-0 space-y-7">{children}</div></AdminShell>;
}
