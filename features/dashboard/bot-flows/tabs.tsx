import { Link } from "@/components/link";
import { cn } from "@/lib/utils";
import { List, Workflow } from "lucide-react";

/** List / Map switch shared by both bot-flow pages. */
export function BotFlowsTabs({ active }: { active: "list" | "map" }) {
  const item = (key: "list" | "map", href: string, Icon: typeof List, label: string) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-[12.5px] transition-colors duration-100",
        active === key ? "bg-card font-medium text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Link>
  );
  return (
    <nav aria-label="Bot flow views" className="flex gap-0.5 rounded-md bg-muted p-0.5">
      {item("list", "/bot-flows", List, "List")}
      {item("map", "/bot-flows/map", Workflow, "Map")}
    </nav>
  );
}
