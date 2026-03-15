import Link from "next/link";
import type { Metadata } from "next";
import { contentfulClient } from "@/lib/contentful";
import { getArtistName, toOgImage } from "@/lib/meta";
import type { WorksSkeleton, NewsSkeleton } from "@/types/contentful";
import WorksCoverSlideshow from "./components/works-cover-slideshow";

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
    title: { absolute: artistName },
    openGraph: {
      title: artistName,
      ...(coverUrl ? { images: toOgImage(coverUrl) } : {}),
    },
  };
}

export default async function HomePage() {
  const now = new Date();
  const threeYearsAgo = new Date(now);
  threeYearsAgo.setFullYear(now.getFullYear() - 3);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const [worksRes, newsRes] = await Promise.all([
    contentfulClient.withoutUnresolvableLinks.getEntries<WorksSkeleton>({
      content_type: "works",
      order: ["-fields.date"],
      limit: 1,
    }),
    contentfulClient.getEntries<NewsSkeleton>({
      content_type: "news",
      order: ["-fields.registrationDate"],
      "fields.registrationDate[gte]": threeYearsAgo.toISOString() as `${number}-${number}-${number}T${number}:${number}:${number}Z`,
      limit: 5,
    }),
  ]);

  const latestWork = worksRes.items[0];
  const photos = (latestWork?.fields.photos ?? [])
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .filter((p) => !!p.fields.file?.url)
    .map((p) => ({
      id: p.sys.id,
      url: `https:${p.fields.file!.url}?w=1600&fm=webp&q=80`,
      width: p.fields.file!.details?.image?.width ?? 3,
      height: p.fields.file!.details?.image?.height ?? 2,
      title: p.fields.title ?? "",
    }));

  const coverPhoto = photos[0];
  const aspectRatio = coverPhoto
    ? `${coverPhoto.width} / ${coverPhoto.height}`
    : "3 / 2";

  // 1年以内の記事が1件もなければNewsセクションを非表示
  const showNews = newsRes.items.some(
    (item) => new Date(item.fields.registrationDate) >= oneYearAgo,
  );

  const sizes = showNews ? "(max-width: 640px) 100vw, 50vw" : "100vw";

  return (
    <main className="">
      <div className={`grid grid-cols-1 border-t border-zinc-200 dark:border-zinc-800 ${showNews ? "sm:grid-cols-2" : ""}`}>

        {/* Works */}
        <div className="border-b border-r border-zinc-200 dark:border-zinc-800">
          <Link href={latestWork?.fields.slug ? `/works/${latestWork.fields.slug}` : "/works"}>
            {photos.length > 0 ? (
              <WorksCoverSlideshow
                photos={photos}
                aspectRatio={aspectRatio}
                sizes={sizes}
              />
            ) : (
              <div className="aspect-[3/2] w-full bg-zinc-100 dark:bg-zinc-900" />
            )}
          </Link>
          <div className="px-8 py-8 sm:px-10 lg:px-12">
            <Link href="/works">
              <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300">
                Works
              </p>
            </Link>
            {latestWork?.fields.title && latestWork.fields.slug && (
              <Link href={`/works/${latestWork.fields.slug}`}>
                <p className="mt-3 font-mono text-sm font-light tracking-[0.05em] text-zinc-900 underline-offset-4 transition-colors hover:underline dark:text-zinc-100">
                  {latestWork.fields.title}
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* News */}
        {showNews && (
          <div className="border-b border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex h-full flex-col px-8 py-10 sm:px-10 lg:px-12">
              <Link href="/news">
                <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300">
                  News
                </p>
              </Link>
              <div className="mt-8 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
                {newsRes.items.map((item) => {
                  const date = item.fields.registrationDate
                    .split("T")[0]
                    .replace(/-/g, ".");
                  return (
                    <div key={item.sys.id} className="py-6 first:pt-0">
                      <p className="font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
                        {date}
                      </p>
                      <Link href={`/news/${item.sys.id}`}>
                        <p className="mt-2 font-mono text-sm font-light leading-6 tracking-[0.05em] text-zinc-900 underline-offset-4 transition-colors hover:underline dark:text-zinc-100">
                          {item.fields.newsTitle}
                        </p>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
