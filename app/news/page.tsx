import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { contentfulClient } from "@/lib/contentful";
import type { NewsSkeleton } from "@/types/contentful";

const richTextOptions = {
  renderNode: {
    [BLOCKS.OL_LIST]: (_node: unknown, children: React.ReactNode) => (
      <ol className="mt-4 space-y-2">{children}</ol>
    ),
    [BLOCKS.UL_LIST]: (_node: unknown, children: React.ReactNode) => (
      <ul className="mt-4 space-y-2">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (_node: unknown, children: React.ReactNode) => (
      <li className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {children}
      </li>
    ),
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: React.ReactNode) => (
      <>{children}</>
    ),
  },
};

export default async function NewsPage() {
  const entries = await contentfulClient.getEntries<NewsSkeleton>({
    content_type: "news",
    order: ["-fields.registrationDate"],
  });

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="px-8 pt-20 pb-16 sm:px-12 lg:px-16">
        <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
          News
        </p>
      </header>

      <div className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
        {entries.items.map((entry) => {
          const [datePart] = entry.fields.registrationDate.split("T");
          const [year, month, day] = datePart.split("-");
          const hostname = new URL(entry.fields.url).hostname;

          return (
            <article
              key={entry.sys.id}
              className="flex flex-col border-b border-r border-zinc-200 px-8 py-12 sm:px-10 lg:px-12 dark:border-zinc-800"
            >
              {/* 日付 */}
              <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
                {`${year}.${month}.${day}`}
              </p>

              {/* タイトル */}
              <p className="mt-5 text-sm font-medium leading-7 text-zinc-900 dark:text-zinc-100">
                {entry.fields.newsTitle}
              </p>

              {/* RichText コンテンツ */}
              <div className="mt-1">
                {documentToReactComponents(entry.fields.content, richTextOptions)}
              </div>

              {/* URL リンク */}
              <a
                href={entry.fields.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 self-start font-mono text-[10px] tracking-wider text-zinc-400 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
              >
                {hostname} ↗
              </a>
            </article>
          );
        })}
      </div>
    </main>
  );
}
