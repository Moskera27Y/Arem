"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: string;
};

type VTDocument = Document & {
  startViewTransition?: (callback: () => void) => void;
};

/**
 * Link with native View Transitions (Chrome/Edge/Safari 18+).
 * Falls back to a normal Next.js navigation elsewhere — same markup,
 * zero layout shift, no new dependencies.
 */
export function ViewTransitionLink({ href, children, ...rest }: Props) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    let url: URL;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    const start = (document as VTDocument).startViewTransition;
    if (start) {
      e.preventDefault();
      start(() => router.push(href));
    }
  };

  return (
    <Link href={href} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
