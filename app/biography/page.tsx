import type { Metadata } from "next";
import { contentfulClient } from "@/lib/contentful";
import type { BiographySkeleton } from "@/types/contentful";

export const metadata: Metadata = {
  title: "Biography",
};

export default async function BiographyPage() {
  const entries = await contentfulClient.getEntries<BiographySkeleton>({
    content_type: "biography",
    order: ["-fields.date"],
  });

  return (
    <main className="">
      <header className="px-8 pt-10 pb-14 sm:px-12 lg:px-16">
        <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
          Biography
        </h1>
      </header>
      <div className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800">
        {entries.items.map((entry) => {
          const [year, month, day] = entry.fields.date.split("-");
          return (
            <article
              key={entry.sys.id}
              className="border-b border-r border-zinc-200 px-8 py-12 sm:px-10 lg:px-12 dark:border-zinc-800"
            >
              {/* 日付：補助情報として控えめに */}
              <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
                {`${year}.${month}.${day}`}
              </p>
              {/* 本文：高コントラストで確実に読める */}
              <p className="mt-5 text-sm leading-7 text-zinc-900 dark:text-zinc-100">
                {entry.fields.content}
              </p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
