import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import NavLinks from "./components/nav-links";
import HeaderName from "./components/header-name";
import { contentfulClient } from "@/lib/contentful";
import { getArtistName } from "@/lib/meta";
import type { AboutSkeleton } from "@/types/contentful";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const name = await getArtistName();
  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: "Photography Portfolio",
    metadataBase: new URL(
      (() => {
        const u = process.env.NEXT_PUBLIC_SITE_URL ?? "";
        if (!u) return "http://localhost:3000";
        return /^https?:\/\//.test(u) ? u : `https://${u}`;
      })()
    ),
    openGraph: {
      siteName: name,
      type: "website",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [jaRes, enRes] = await Promise.all([
    contentfulClient.getEntries<AboutSkeleton>({
      content_type: "about",
      limit: 1,
      locale: "ja-JP",
    }),
    contentfulClient.getEntries<AboutSkeleton>({
      content_type: "about",
      limit: 1,
      locale: "en-US",
    }),
  ]);

  const jaAbout = jaRes.items[0];
  const enAbout = enRes.items[0];
  const color = jaAbout?.fields.color ?? "#a1a1aa";
  const jaName = jaAbout?.fields.name ?? "";
  const enName = enAbout?.fields.name ?? "";

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-white antialiased dark:bg-zinc-950`}
      >
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-3 px-8 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5 sm:px-12 lg:px-16">
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-60"
            >
              <div
                className="h-4 w-4 shrink-0"
                style={{ backgroundColor: color }}
              />
              <HeaderName jaName={jaName} enName={enName} />
            </Link>
            <NavLinks />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
