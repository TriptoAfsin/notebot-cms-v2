
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // false during SSR and hydration, true afterwards: the theme is only known in the browser.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  if (!mounted) return <Button variant="ghost" size="icon-sm" />;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
