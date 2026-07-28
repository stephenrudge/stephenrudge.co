import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Stories are managed in Sanity Studio now. */
export default function AdminPage() {
  redirect("/studio");
}
