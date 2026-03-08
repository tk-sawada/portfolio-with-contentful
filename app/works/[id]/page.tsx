import Image from "next/image";
import Link from "next/link";
import { contentfulClient } from "@/lib/contentful";
import type { WorksSkeleton } from "@/types/contentful";

export async function generateStaticParams() {
  const entries = await contentfulClient.getEntries<WorksSkeleton>({
    content_type: "works",
    select: ["sys.id"],
  });
  return entries.items.map((entry) => ({ id: entry.sys.id }));
}

export default async function WorksDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await contentfulClient.withoutUnresolvableLinks.getEntry<WorksSkeleton>(id);

  const [datePart] = entry.fields.date.split("T");
  const [year, month, day] = datePart.split("-");

  const photos = entry.fields.photos.filter(
    (p): p is NonNullable<typeof p> => p !== undefined,
  );

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="px-8 pt-20 pb-16 sm:px-12 lg:px-16">
        {/* 戻るリンク */}
        <Link
          href="/works"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Works
        </Link>

        {/* タイトル・日付 */}
        <div className="mt-8">
          <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
            {`${year}.${month}.${day}`}
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            {entry.fields.title}
          </p>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-600">
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </p>
        </div>
      </header>

      {/* 画像一覧 */}
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        {photos.map((photo, index) => {
          const fileUrl = photo.fields.file?.url;
          const imageWidth = photo.fields.file?.details?.image?.width ?? 3;
          const imageHeight = photo.fields.file?.details?.image?.height ?? 2;
          const imageUrl = `https:${fileUrl}?w=2400&fm=webp&q=85`;

          return (
            <figure
              key={photo.sys.id}
              className="border-b border-zinc-200 dark:border-zinc-800"
            >
              {/* 画像 */}
              <div
                className="relative w-full bg-zinc-100 dark:bg-zinc-900"
                style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
              >
                <Image
                  src={imageUrl}
                  alt={photo.fields.title ?? ""}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>

              {/* キャプション */}
              {(photo.fields.title || photo.fields.description) && (
                <figcaption className="px-8 py-6 sm:px-12 lg:px-16">
                  {photo.fields.title && (
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {photo.fields.title}
                    </p>
                  )}
                  {photo.fields.description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                      {photo.fields.description}
                    </p>
                  )}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </main>
  );
}
