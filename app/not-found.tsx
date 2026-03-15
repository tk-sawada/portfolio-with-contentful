import Link from "next/link";

export default function NotFound() {
  return (
    <main className="">
      <div className="px-8 py-24 sm:px-12 lg:px-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
          404
        </p>
        <p className="mt-6 font-mono text-2xl font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
          Page not found
        </p>
        <Link
          href="/"
          className="mt-10 inline-block font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Home
        </Link>
      </div>
    </main>
  );
}
