import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { contentfulClient } from "@/lib/contentful";
import { getArtistName, toOgImage } from "@/lib/meta";
import type { WorksSkeleton } from "@/types/contentful";

export async function generateMetadata(): Promise<Metadata> {
  const [worksRes, artistName] = await Promise.all([
    contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
      content_type: "works",
      order: ["-fields.date"],
      limit: 1,
    }),
    getArtistName(),
  ]);
  const coverUrl = (worksRes.items[0]?.fields.photos ?? [])
    .filter((p): p is NonNullable<typeof p> => p !== undefined)[0]
    ?.fields.file?.url;
  return {
    title: "Works",
    openGraph: {
      title: `Works | ${artistName}`,
      ...(coverUrl ? { images: toOgImage(coverUrl) } : {}),
    },
  };
}

export default async function WorksPage() {
  const entries = await contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
    content_type: "works",
    order: ["-fields.date"],
  });

  return (
    <main className="">
      <header className="px-8 pt-10 pb-14 sm:px-12 lg:px-16">
        <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
          Works
        </h1>
      </header>
      <div className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
        {entries.items.map((entry) => {
          if (!entry.fields.slug) return null;

          const photos = (entry.fields.photos ?? []).filter(
            (p): p is NonNullable<typeof p> => p !== undefined,
          );
          const cover = photos[0];

          const dateParts = entry.fields.date?.split("T")[0].split("-") ?? [];
          const [year, month, day] = dateParts;

          return (
            <Link
              key={entry.sys.id}
              href={`/works/${entry.fields.slug}`}
              className="group border-b border-r border-zinc-200 dark:border-zinc-800"
            >
              {/* カバー画像 */}
              {cover ? (
                <div
                  className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                  style={{
                    aspectRatio: `${cover.fields.file?.details?.image?.width ?? 3} / ${cover.fields.file?.details?.image?.height ?? 2}`,
                  }}
                >
                  <Image
                    src={`https:${cover.fields.file?.url}?w=1200&fm=webp&q=80`}
                    alt={cover.fields.title ?? ""}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] w-full bg-zinc-100 dark:bg-zinc-900" />
              )}

              {/* メタデータ */}
              <div className="px-8 py-8 sm:px-10 lg:px-12">
                {year && month && day && (
                  <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
                    {`${year}.${month}.${day}`}
                  </p>
                )}
                <p className={`font-mono text-sm font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100 ${year ? "mt-3" : ""}`}>
                  {entry.fields.title}
                </p>
                {photos.length > 0 && (
                  <p className="mt-1 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-600">
                    {photos.length} {photos.length === 1 ? "photo" : "photos"}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
