"use client";

import { useEffect, useState } from "react";

export default function HeaderName({
  jaName,
  enName,
}: {
  jaName: string;
  enName: string;
}) {
  const [name, setName] = useState(jaName);

  useEffect(() => {
    const isJapanese = /^ja\b/.test(navigator.language);
    setName(isJapanese ? jaName : (enName || jaName));
  }, [jaName, enName]);

  if (!name) return null;
  return (
    <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
      {name}
    </span>
  );
}
