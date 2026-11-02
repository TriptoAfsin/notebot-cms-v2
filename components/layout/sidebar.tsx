import { Link } from "@/components/link";
import { usePathname } from "@/lib/navigation";
import {
  BookOpen, GraduationCap, Layers, FlaskConical, HelpCircle, Calendar, Home, Users, Mail, FileInput,
  HeartHandshake, FileText, FilePlus2, History, ChartLine, Bot, KeyRound, ScrollText, Tags, Webhook, Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavCounts } from "@/lib/nav-counts";

type NavItem = { href: string; label: string; icon: LucideIcon; count?: keyof NavCounts };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/analytics", label: "Analytics", icon: ChartLine },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/content/new", label: "Add content", icon: FilePlus2 },
      { href: "/levels", label: "Levels", icon: Layers },
      { href: "/subjects", label: "Subjects", icon: GraduationCap },
      { href: "/topics", label: "Topics", icon: BookOpen },
      { href: "/notes", label: "Notes", icon: FileText, count: "notes" },
      { href: "/lab-reports", label: "Lab reports", icon: FlaskConical, count: "labReports" },
      { href: "/question-banks", label: "Question banks", icon: HelpCircle, count: "questionBanks" },
      { href: "/routines", label: "Routines", icon: Calendar },
      { href: "/syllabuses", label: "Syllabuses", icon: ScrollText },
      { href: "/results", label: "Results", icon: Trophy },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/submissions", label: "Submissions", icon: FileInput, count: "pending" },
      { href: "/contributors", label: "Contributors", icon: HeartHandshake },
      { href: "/users", label: "Users", icon: Users },
      { href: "/invitations", label: "Invitations", icon: Mail },
    ],
  },
  {
    label: "Bot",
    items: [{ href: "/bot-flows", label: "Bot flows", icon: Bot, count: "botFlows" }],
  },
  {
    label: "System",
    items: [
      { href: "/audit", label: "Audit log", icon: History },
      { href: "/api-keys", label: "API keys", icon: KeyRound },
      { href: "/webhooks", label: "Webhooks", icon: Webhook },
      { href: "/settings/taxonomy", label: "Taxonomy", icon: Tags },
    ],
  },
];

const navItems = navGroups.flatMap((g) => g.items);
export { navItems };

const nf = new Intl.NumberFormat("en-US");

export function SidebarContent({ onNavigate, counts }: { onNavigate?: () => void; counts?: NavCounts }) {
  const pathname = usePathname();

  return (
    <>
      <Link href="/dashboard" onClick={onNavigate} className="mb-3 flex items-center gap-2 rounded-md px-3 py-1">
        <img src="/notebot-logo.png" alt="" width={22} height={22} className="rounded-[5px]" />
        <span className="text-[14px] font-semibold tracking-[-0.01em]">NoteBot CMS</span>
      </Link>
      <nav className="flex-1 space-y-3 px-2" aria-label="Main">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 pt-1 pb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-px">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
                const n = item.count && counts ? counts[item.count] : undefined;
                const hot = item.count === "pending" && !!n;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13.5px] transition-colors duration-100",
                      isActive
                        ? "bg-sidebar-accent font-medium text-foreground before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-[3px] before:rounded-r-[3px] before:bg-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                    {n !== undefined && (n > 0 || item.count !== "pending") && (
                      <span className={cn("ml-auto font-mono text-[11.5px] tabular-nums", hot ? "text-primary" : "text-muted-foreground")}>
                        {hot ? `${n} new` : nf.format(n)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

export function AppSidebar({ counts }: { counts?: NavCounts }) {
  return (
    // sticky + h-screen pins the sidebar to one viewport; the nav scrolls when it outgrows it.
    <aside className="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar py-3">
      <SidebarContent counts={counts} />
    </aside>
  );
}
