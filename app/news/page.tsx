import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { contentfulClient } from "@/lib/contentful";
import { isSafeUrl } from "@/lib/url";
import type { NewsSkeleton } from "@/types/contentful";

export const metadata: Metadata = {
  title: "News",
};

const richTextOptions = {
  renderNode: {
    [BLOCKS.OL_LIST]: (_node: unknown, children: ReactNode) => (
      <ol className="mt-4 space-y-2">{children}</ol>
    ),
    [BLOCKS.UL_LIST]: (_node: unknown, children: ReactNode) => (
      <ul className="mt-4 space-y-2">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (_node: unknown, children: ReactNode) => (
      <li className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {children}
      </li>
    ),
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: ReactNode) => (
      <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{children}</p>
    ),
  },
};

export default async function NewsPage() {
  const entries = await contentfulClient.getEntries<NewsSkeleton>({
    content_type: "news",
    order: ["-fields.registrationDate"],
  });

  return (
    <main className="">
      <header className="px-8 pt-10 pb-14 sm:px-12 lg:px-16">
        <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500">
          News
        </h1>
      </header>
      <div className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
        {entries.items.map((entry) => {
          const [datePart] = entry.fields.registrationDate.split("T");
          const [year, month, day] = datePart.split("-");
          const safeUrl = isSafeUrl(entry.fields.url) ? entry.fields.url : null;
          const hostname = safeUrl ? new URL(safeUrl).hostname : null;

          return (
            <article
              key={entry.sys.id}
              className="flex flex-col border-b border-r border-zinc-200 px-8 py-12 sm:px-10 lg:px-12 dark:border-zinc-800"
            >
              {/* 日付 */}
              <p className="font-mono text-[10px] tracking-widest text-zinc-500 dark:text-zinc-400">
                {`${year}.${month}.${day}`}
              </p>

              {/* タイトル */}
              <Link
                href={`/news/${entry.sys.id}`}
                className="mt-5 font-mono text-sm font-light leading-7 tracking-[0.05em] text-zinc-900 underline-offset-4 transition-colors hover:underline dark:text-zinc-100"
              >
                {entry.fields.newsTitle}
              </Link>

              {/* RichText コンテンツ */}
              <div className="mt-1">
                {documentToReactComponents(entry.fields.content, richTextOptions)}
              </div>

              {/* URL リンク */}
              {hostname && (
                <a
                  href={safeUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 self-start font-mono text-[10px] tracking-wider text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {hostname} ↗
                </a>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
