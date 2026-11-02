import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useRouter } from "@tanstack/react-router";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  replace?: boolean;
  /** accepted for compatibility with next/link; navigation always resets scroll unless replace */
  scroll?: boolean;
  prefetch?: boolean;
};

/**
 * Replacement for `next/link` and next-view-transitions' `Link`: a real <a href> (middle-click,
 * copy link and crawlers keep working) that navigates client-side through the router, preloads on
 * hover/focus, and gets a View Transition because the router enables them by default.
 */
export const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, replace, scroll: _scroll, prefetch = true, onClick, onMouseEnter, onFocus, target, ...rest },
  ref
) {
  const router = useRouter();
  const internal = href.startsWith("/") && !href.startsWith("//") && (!target || target === "_self");

  const preload = () => {
    if (internal && prefetch) router.preloadRoute({ href } as never).catch(() => {});
  };

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || !internal || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    router.navigate({ href, replace });
  }

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      onClick={handleClick}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        preload();
      }}
      onFocus={(e) => {
        onFocus?.(e);
        preload();
      }}
      {...rest}
    />
  );
});

export default Link;
