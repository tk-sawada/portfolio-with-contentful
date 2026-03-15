"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type WorksPhotoData = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  jaTitle?: string;
  jaDescription?: string;
  enTitle?: string;
  enDescription?: string;
};

export default function WorksPhotoList({ photos }: { photos: WorksPhotoData[] }) {
  const [isJapanese, setIsJapanese] = useState(true);

  useEffect(() => {
    setIsJapanese(/^ja\b/.test(navigator.language));
  }, []);

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800">
      {photos.map((photo, index) => {
        const title = isJapanese
          ? (photo.jaTitle || photo.enTitle)
          : (photo.enTitle || photo.jaTitle);
        const description = isJapanese
          ? (photo.jaDescription || photo.enDescription)
          : (photo.enDescription || photo.jaDescription);

        return (
          <figure
            key={photo.id}
            className="border-b border-zinc-200 dark:border-zinc-800"
          >
            <div
              className="relative w-full bg-zinc-100 dark:bg-zinc-900"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            >
              <Image
                src={photo.imageUrl}
                alt={title ?? ""}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>

            {(title || description) && (
              <figcaption className="px-8 py-6 sm:px-12 lg:px-16">
                {title && (
                  <p className="font-mono text-sm font-light tracking-[0.05em] text-zinc-900 dark:text-zinc-100">
                    {title}
                  </p>
                )}
                {description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                    {description}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
