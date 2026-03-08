import Image from "next/image";
import Link from "next/link";
import { contentfulClient } from "@/lib/contentful";
import type { WorksSkeleton } from "@/types/contentful";

export default async function WorksPage() {
  const entries = await contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
    content_type: "works",
    order: ["-fields.date"],
  });

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="px-8 pt-20 pb-16 sm:px-12 lg:px-16">
        <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
          Works
        </p>
      </header>

      <div className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-2 dark:border-zinc-800">
        {entries.items.map((entry) => {
          const photos = entry.fields.photos.filter(
            (p): p is NonNullable<typeof p> => p !== undefined,
          );
          const cover = photos[0];
          if (!cover) return null;

          const fileUrl = cover.fields.file?.url;
          const imageWidth = cover.fields.file?.details?.image?.width ?? 3;
          const imageHeight = cover.fields.file?.details?.image?.height ?? 2;
          const imageUrl = `https:${fileUrl}?w=1200&fm=webp&q=80`;

          const [datePart] = entry.fields.date.split("T");
          const [year, month, day] = datePart.split("-");

          return (
            <Link
              key={entry.sys.id}
              href={`/works/${entry.sys.id}`}
              className="group border-b border-r border-zinc-200 dark:border-zinc-800"
            >
              {/* カバー画像 */}
              <div
                className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
              >
                <Image
                  src={imageUrl}
                  alt={cover.fields.title ?? ""}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* メタデータ */}
              <div className="px-8 py-8 sm:px-10 lg:px-12">
                <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
                  {`${year}.${month}.${day}`}
                </p>
                <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {entry.fields.title}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-600">
                  {photos.length} {photos.length === 1 ? "photo" : "photos"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
