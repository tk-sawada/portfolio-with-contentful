"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type SlideshowPhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
  title: string;
};

export default function WorksCoverSlideshow({
  photos,
  aspectRatio,
  sizes,
}: {
  photos: SlideshowPhoto[];
  aspectRatio: string;
  sizes: string;
}) {
  const [order, setOrder] = useState<SlideshowPhoto[]>(photos);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
    setIndex(0);
  }, [photos]);

  useEffect(() => {
    if (order.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % order.length);
        setVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [order]);

  const photo = order[index];
  if (!photo) return <div className="aspect-[3/2] w-full bg-zinc-100 dark:bg-zinc-900" />;

  return (
    <div
      className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
      style={{ aspectRatio }}
    >
      <Image
        src={photo.url}
        alt={photo.title}
        fill
        sizes={sizes}
        className={`object-cover transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        priority
      />
    </div>
  );
}
