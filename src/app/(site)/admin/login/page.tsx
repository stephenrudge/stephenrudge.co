import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md pt-10">
      <h1 className="text-center font-serif text-3xl text-zinc-900 dark:text-zinc-50">
        Admin login
      </h1>
      <p className="mt-2 mb-8 text-center text-sm text-zinc-500">
        Sign in to write and publish travel stories.
      </p>
      <LoginForm />
    </div>
  );
}
