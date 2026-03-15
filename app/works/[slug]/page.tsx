import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { contentfulClient } from "@/lib/contentful";
import { getArtistName, toOgImage } from "@/lib/meta";
import type { WorksSkeleton } from "@/types/contentful";
import WorksPhotoList, { type WorksPhotoData } from "@/app/components/works-photo-list";

export async function generateStaticParams() {
  const entries = await contentfulClient.getEntries<WorksSkeleton>({
    content_type: "works",
    select: ["fields.slug"],
  });
  return entries.items
    .filter((entry) => !!entry.fields.slug)
    .map((entry) => ({ slug: entry.fields.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [entries, artistName] = await Promise.all([
    contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
      content_type: "works",
      "fields.slug": slug,
      limit: 1,
      locale: "ja-JP",
    }),
    getArtistName(),
  ]);
  const entry = entries.items[0];
  if (!entry) return { title: artistName };

  const coverUrl = (entry.fields.photos ?? [])
    .filter((p): p is NonNullable<typeof p> => p !== undefined)[0]
    ?.fields.file?.url;

  return {
    title: entry.fields.title,
    openGraph: {
      title: `${entry.fields.title} | ${artistName}`,
      ...(coverUrl ? { images: toOgImage(coverUrl) } : {}),
    },
  };
}

export default async function WorksDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const fetchEntries = (locale: string) =>
    contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
      content_type: "works",
      "fields.slug": slug,
      limit: 1,
      locale,
    });

  const [jaRes, enRes] = await Promise.all([
    fetchEntries("ja-JP"),
    fetchEntries("en-US"),
  ]);

  const entry = jaRes.items[0];
  if (!entry) notFound();

  const dateParts = entry.fields.date?.split("T")[0].split("-") ?? [];
  const [year, month, day] = dateParts;

  const toPhotos = (res: typeof jaRes) =>
    (res.items[0]?.fields.photos ?? []).filter(
      (p): p is NonNullable<typeof p> => p !== undefined,
    );

  const jaPhotos = toPhotos(jaRes);
  const enPhotos = toPhotos(enRes);

  const photos: WorksPhotoData[] = jaPhotos
    .filter((p) => !!p.fields.file?.url)
    .map((p, i) => ({
      id: p.sys.id,
      imageUrl: `https:${p.fields.file!.url}?w=2400&fm=webp&q=85`,
      width: p.fields.file!.details?.image?.width ?? 3,
      height: p.fields.file!.details?.image?.height ?? 2,
      jaTitle: p.fields.title,
      jaDescription: p.fields.description,
      enTitle: enPhotos[i]?.fields.title,
      enDescription: enPhotos[i]?.fields.description,
    }));

  return (
    <main className="">
      <header className="px-8 pt-10 pb-16 sm:px-12 lg:px-16">
        <Link
          href="/works"
          className="font-mono text-[10px] tracking-widest text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Works
        </Link>
        <div className="mt-8">
          {year && month && day && (
            <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
              {`${year}.${month}.${day}`}
            </p>
          )}
          <p className={`font-mono text-2xl font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100 ${year ? "mt-3" : ""}`}>
            {entry.fields.title}
          </p>
          {photos.length > 0 && (
            <p className="mt-2 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-600">
              {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </p>
          )}
        </div>
      </header>

      <WorksPhotoList photos={photos} />
    </main>
  );
}
