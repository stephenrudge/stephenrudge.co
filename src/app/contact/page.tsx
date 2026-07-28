import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Stephen Rudge to collaborate on a project or host him on the road.",
};

export default function ContactPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        Contact
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        Want to collaborate on a story, dive, or creative project — or host me
        while I&apos;m traveling through your corner of the world? Send a note
        and I&apos;ll follow up.
      </p>

      <div className="mt-10">
        <ContactForm />
      </div>

      {contactEmail ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          Prefer email?{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="text-accent hover:underline"
          >
            {contactEmail}
          </a>
        </p>
      ) : null}
    </div>
  );
}
