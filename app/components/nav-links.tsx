"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/news", label: "News" },
  { href: "/works", label: "Works" },
  { href: "/biography", label: "Biography" },
  { href: "/about", label: "About" },
] as const;

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="w-full sm:w-auto">
      <ul className="flex items-center justify-between sm:justify-start sm:gap-8">
        {links.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`text-[9px] font-medium uppercase tracking-[0.15em] transition-colors sm:tracking-[0.5em] ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
