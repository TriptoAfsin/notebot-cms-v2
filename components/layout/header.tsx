import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter, usePathname } from "@/lib/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarContent, navItems } from "@/components/layout/sidebar";
import type { NavCounts } from "@/lib/nav-counts";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GROUP_OF: Record<string, string> = {
  "/dashboard": "Overview", "/analytics": "Overview",
  "/submissions": "Community", "/contributors": "Community", "/users": "Community", "/invitations": "Community",
  "/bot-flows": "Bot", "/audit": "System", "/api-keys": "System", "/webhooks": "System", "/settings/taxonomy": "System",
};

/** "Content / Notes / Edit" style breadcrumb derived from the URL. */
function useCrumbs() {
  const pathname = usePathname();
  const item = [...navItems].sort((a, b) => b.href.length - a.href.length).find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  if (!item) return [];
  const rest = pathname.slice(item.href.length).split("/").filter(Boolean);
  const tail = rest[0] === "new" ? "New" : rest[0] === "settings" ? "Settings" : rest[0] ? "Edit" : null;
  return [GROUP_OF[item.href] ?? "Content", item.label, ...(tail ? [tail] : [])];
}

export function AppHeader({ user, counts }: { user?: { name: string; email: string } | null; counts?: NavCounts }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const crumbs = useCrumbs();
  const initials = (user?.name || user?.email || "?").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md md:px-5">
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0 pt-3">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarContent counts={counts} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <nav aria-label="Breadcrumb" className="min-w-0 truncate text-[13px] text-muted-foreground">
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span className="px-1.5 opacity-60">/</span>}
            <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : ""}>{c}</span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" title={user?.email}>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-muted font-mono text-[10.5px] font-medium text-foreground">
                {initials}
              </span>
              <span className="hidden max-w-[140px] truncate sm:inline">{user?.name || user?.email}</span>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>You will be taken to the sign-in page.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-white hover:bg-destructive/90">
                Sign out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
