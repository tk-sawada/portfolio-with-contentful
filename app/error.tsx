"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="">
      <div className="px-8 py-24 sm:px-12 lg:px-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">
          Error
        </p>
        <p className="mt-6 font-mono text-2xl font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </p>
        <div className="mt-10 flex items-center gap-8">
          <button
            onClick={reset}
            className="font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
