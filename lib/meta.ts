import { contentfulClient } from "./contentful";
import type { AboutSkeleton } from "@/types/contentful";

export async function getArtistName(): Promise<string> {
  const res = await contentfulClient.getEntries<AboutSkeleton>({
    content_type: "about",
    limit: 1,
    locale: "ja-JP",
  });
  return res.items[0]?.fields.name ?? "Portfolio";
}

export function toOgImage(fileUrl: string): { url: string; width: number; height: number }[] {
  return [{
    url: `https:${fileUrl}?w=1200&h=630&fit=fill&fm=jpg&q=85`,
    width: 1200,
    height: 630,
  }];
}
