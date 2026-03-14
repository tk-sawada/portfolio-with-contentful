import Image from "next/image";
import Link from "next/link";
import { contentfulClient } from "@/lib/contentful";
import type { WorksSkeleton, NewsSkeleton } from "@/types/contentful";

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
      limit: 3,
    }),
  ]);

  const latestWork = worksRes.items[0];
  const coverPhoto = latestWork?.fields.photos
    ?.filter((p): p is NonNullable<typeof p> => p !== undefined)[0];

  // 1年以内の記事が1件もなければNewsセクションを非表示
  const showNews = newsRes.items.some(
    (item) => new Date(item.fields.registrationDate) >= oneYearAgo,
  );

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">

      {/* ヒーロー */}
      <section className="flex min-h-[55vh] flex-col justify-between px-8 pt-10 pb-0 sm:px-12 lg:px-20">
        <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
          Portfolio
        </p>
        <div className="pb-20">
          <h1 className="text-[clamp(3.5rem,11vw,9rem)] font-light leading-[0.9] tracking-tight text-zinc-900 dark:text-zinc-100">
            Photography
          </h1>
          <p className="mt-6 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
            Based in Japan
          </p>
        </div>
      </section>

      {/* ナビゲーショングリッド */}
      <div className={`grid grid-cols-1 border-t border-zinc-200 dark:border-zinc-800 ${showNews ? "sm:grid-cols-2" : ""}`}>

        {/* Works */}
        <Link
          href="/works"
          className="group border-b border-r border-zinc-200 dark:border-zinc-800"
        >
          {coverPhoto?.fields.file?.url ? (
            <div
              className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
              style={{
                aspectRatio: `${coverPhoto.fields.file.details?.image?.width ?? 3} / ${coverPhoto.fields.file.details?.image?.height ?? 2}`,
              }}
            >
              <Image
                src={`https:${coverPhoto.fields.file.url}?w=1600&fm=webp&q=80`}
                alt={coverPhoto.fields.title ?? ""}
                fill
                sizes={showNews ? "(max-width: 640px) 100vw, 50vw" : "100vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
          ) : (
            <div className="aspect-[3/2] w-full bg-zinc-100 dark:bg-zinc-900" />
          )}
          <div className="px-8 py-8 sm:px-10 lg:px-12">
            <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
              Works
            </p>
            {latestWork?.fields.title && (
              <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {latestWork.fields.title}
              </p>
            )}
          </div>
        </Link>

        {/* News */}
        {showNews && (
          <Link
            href="/news"
            className="border-b border-r border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex h-full flex-col px-8 py-10 sm:px-10 lg:px-12">
              <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
                News
              </p>
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
                      <p className="mt-2 text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
                        {item.fields.newsTitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Link>
        )}

      </div>
    </main>
  );
}
