import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Shield, ListChecks, Building2, Tag } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-red-600">
            <Shield className="h-5 w-5" />
            Admin Panel
          </div>
          <nav className="flex gap-1">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100">
              Overview
            </Link>
            <Link href="/admin/queue" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <ListChecks className="h-4 w-4" /> Queue
            </Link>
            <Link href="/admin/clubs" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <Building2 className="h-4 w-4" /> Clubs
            </Link>
            <Link href="/admin/interests" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-1">
              <Tag className="h-4 w-4" /> Interests
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
