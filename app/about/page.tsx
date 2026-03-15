import Image from "next/image";
import type { Metadata } from "next";
import { contentfulClient } from "@/lib/contentful";
import type { AboutSkeleton } from "@/types/contentful";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const entries = await contentfulClient.getEntries<AboutSkeleton>({
    content_type: "about",
    limit: 1,
  });

  const about = entries.items[0];

  return (
    <main className="">
      <header className="px-8 pt-10 pb-14 sm:px-12 lg:px-16">
        <h1 className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
          About
        </h1>
      </header>

      {about && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="px-8 py-16 sm:px-12 lg:px-16">

            {/* Name */}
            <p className="font-mono text-3xl font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
              {about.fields.name}
            </p>

            {/* Description */}
            {about.fields.description && (
              <p className="mt-3 font-mono text-[10px] tracking-widest text-zinc-400 dark:text-zinc-500">
                {about.fields.description}
              </p>
            )}

            {/* Color swatch */}
            {about.fields.color && (
              <div
                className="mt-6 h-1 w-12"
                style={{ backgroundColor: about.fields.color }}
              />
            )}

            {/* Instagram */}
            {about.fields.instagram && (
              <a
                href={`https://www.instagram.com/${about.fields.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-3 transition-opacity hover:opacity-60"
              >
                {/* Light mode: black logo */}
                <Image
                  src="/Instagram_Glyph_Black.svg"
                  alt="Instagram"
                  width={18}
                  height={18}
                  className="dark:hidden"
                />
                {/* Dark mode: white logo */}
                <Image
                  src="/Instagram_Glyph_White.svg"
                  alt="Instagram"
                  width={18}
                  height={18}
                  className="hidden dark:block"
                />
                <span className="font-mono text-[10px] tracking-widest text-zinc-500 dark:text-zinc-500">
                  @{about.fields.instagram}
                </span>
              </a>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
