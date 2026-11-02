import { useMemo } from "react";
import { notFound as tsrNotFound, redirect as tsrRedirect, useLocation, useParams as useTsrParams, useRouter as useTsrRouter } from "@tanstack/react-router";

/**
 * Drop-in replacements for the `next/navigation` hooks the CMS used, backed by TanStack Router.
 * Components keep their call sites (`router.push(href)`, `router.refresh()`, …).
 */
export function useRouter() {
  const router = useTsrRouter();
  return useMemo(
    () => ({
      push: (href: string, _opts?: { scroll?: boolean }) => router.navigate({ href }),
      replace: (href: string, opts?: { scroll?: boolean }) =>
        router.navigate({ href, replace: true, resetScroll: opts?.scroll !== false }),
      /** Next's refresh re-ran the server components; here that is re-running the route loaders. */
      refresh: () => router.invalidate(),
      back: () => router.history.back(),
      forward: () => router.history.forward(),
      prefetch: (href: string) => {
        router.preloadRoute({ href } as never).catch(() => {});
      },
    }),
    [router]
  );
}

export function usePathname(): string {
  return useLocation({ select: (l) => l.pathname });
}

export function useSearchParams(): URLSearchParams {
  const searchStr = useLocation({ select: (l) => l.searchStr });
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useTsrParams({ strict: false }) as T;
}

export function notFound(): never {
  throw tsrNotFound();
}

export function redirect(href: string): never {
  throw tsrRedirect({ href });
}
