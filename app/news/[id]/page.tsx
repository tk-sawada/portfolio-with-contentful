import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { contentfulClient } from "@/lib/contentful";
import { isSafeUrl } from "@/lib/url";
import type { NewsSkeleton } from "@/types/contentful";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = await contentfulClient.getEntry<NewsSkeleton>(id).catch(() => null);
  if (!entry) return {};
  return {
    title: entry.fields.newsTitle,
    openGraph: { title: entry.fields.newsTitle },
  };
}

export async function generateStaticParams() {
  const entries = await contentfulClient.getEntries<NewsSkeleton>({
    content_type: "news",
    select: ["sys.id"],
  });
  return entries.items.map((entry) => ({ id: entry.sys.id }));
}

const richTextOptions = {
  renderNode: {
    [BLOCKS.OL_LIST]: (_node: unknown, children: ReactNode) => (
      <ol className="mt-4 list-decimal space-y-2 pl-5">{children}</ol>
    ),
    [BLOCKS.UL_LIST]: (_node: unknown, children: ReactNode) => (
      <ul className="mt-4 list-disc space-y-2 pl-5">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (_node: unknown, children: ReactNode) => (
      <li className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
        {children}
      </li>
    ),
    [BLOCKS.PARAGRAPH]: (_node: unknown, children: ReactNode) => (
      <p className="mt-4 text-sm leading-7 text-zinc-600 first:mt-0 dark:text-zinc-400">
        {children}
      </p>
    ),
    [INLINES.HYPERLINK]: (node: unknown, children: ReactNode) => {
      const uri = (node as { data: { uri: string } }).data.uri;
      if (!isSafeUrl(uri)) return <>{children}</>;
      return (
        <a
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {children}
        </a>
      );
    },
  },
};

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entry = await contentfulClient.getEntry<NewsSkeleton>(id).catch(() => null);
  if (!entry || entry.sys.contentType.sys.id !== "news") notFound();

  const [datePart] = entry.fields.registrationDate.split("T");
  const [year, month, day] = datePart.split("-");
  const safeUrl = isSafeUrl(entry.fields.url) ? entry.fields.url : null;
  const hostname = safeUrl ? new URL(safeUrl).hostname : null;

  return (
    <main className="">
      <header className="px-8 pt-10 pb-16 sm:px-12 lg:px-16">
        <Link
          href="/news"
          className="font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← News
        </Link>
        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
            {`${year}.${month}.${day}`}
          </p>
          <p className="mt-3 text-2xl font-mono font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
            {entry.fields.newsTitle}
          </p>
        </div>
      </header>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="px-8 py-12 sm:px-12 lg:px-16">
          <div className="max-w-xl">
            {documentToReactComponents(entry.fields.content, richTextOptions)}
          </div>

          {hostname && (
            <a
              href={safeUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-12 inline-block font-mono text-[10px] tracking-wider text-zinc-400 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
            >
              {hostname} ↗
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
