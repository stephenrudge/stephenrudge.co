import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-serif text-lg text-zinc-900 dark:text-zinc-50"
            >
              Admin
            </Link>
            {authed && (
              <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/admin" className="hover:text-accent">
                  Stories
                </Link>
                <Link href="/admin/new" className="hover:text-accent">
                  New story
                </Link>
                <Link href="/" className="hover:text-accent">
                  View site
                </Link>
              </nav>
            )}
          </div>
          {authed && <AdminLogoutButton />}
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
