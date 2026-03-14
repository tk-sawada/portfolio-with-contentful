import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contentfulClient } from "@/lib/contentful";
import type { WorksSkeleton } from "@/types/contentful";

export async function generateStaticParams() {
  const entries = await contentfulClient.getEntries<WorksSkeleton>({
    content_type: "works",
    select: ["fields.slug"],
  });
  return entries.items
    .filter((entry) => !!entry.fields.slug)
    .map((entry) => ({ slug: entry.fields.slug }));
}

export default async function WorksDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const entries = await contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
    content_type: "works",
    "fields.slug": slug,
    limit: 1,
  });

  const entry = entries.items[0];
  if (!entry) notFound();

  const dateParts = entry.fields.date?.split("T")[0].split("-") ?? [];
  const [year, month, day] = dateParts;

  const photos = (entry.fields.photos ?? []).filter(
    (p): p is NonNullable<typeof p> => p !== undefined,
  );

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="px-8 pt-10 pb-16 sm:px-12 lg:px-16">
        <Link
          href="/works"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Works
        </Link>

        <div className="mt-8">
          {year && month && day && (
            <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
              {`${year}.${month}.${day}`}
            </p>
          )}
          <p className={`text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 ${year ? "mt-3" : ""}`}>
            {entry.fields.title}
          </p>
          {photos.length > 0 && (
            <p className="mt-2 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-600">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </p>
          )}
        </div>
      </header>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        {photos.map((photo, index) => {
          const fileUrl = photo.fields.file?.url;
          if (!fileUrl) return null;

          const imageWidth = photo.fields.file?.details?.image?.width ?? 3;
          const imageHeight = photo.fields.file?.details?.image?.height ?? 2;
          const imageUrl = `https:${fileUrl}?w=2400&fm=webp&q=85`;

          return (
            <figure
              key={photo.sys.id}
              className="border-b border-zinc-200 dark:border-zinc-800"
            >
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
