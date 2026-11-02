import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Thin progress line while a route is loading (replaces nextjs-toploader). Appears after 150ms so
 * fast navigations never flash it.
 */
export function ProgressBar() {
  const loading = useRouterState({ select: (s) => s.isLoading || s.status === "pending" });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setShown(true), 150);
    return () => {
      clearTimeout(t);
      setShown(false);
    };
  }, [loading]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-200 ${loading && shown ? "opacity-100" : "opacity-0"}`}
    >
      <div className="h-full w-full origin-left animate-[progress_1.1s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-primary" />
    </div>
  );
}
