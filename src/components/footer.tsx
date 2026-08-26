import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-lg text-zinc-900 dark:text-zinc-50">
            Stephen Rudge
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Travel logs, field notes, and photography.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/blog" className="hover:text-accent">
            Journal
          </Link>
          <Link href="/portfolio" className="hover:text-accent">
            Portfolio
          </Link>
          <Link href="/destinations" className="hover:text-accent">
            Destinations
          </Link>
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/contact" className="hover:text-accent">
            Contact
          </Link>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        © {new Date().getFullYear()} Stephen Rudge · stephenRudge.co
      </div>
    </footer>
  );
}
