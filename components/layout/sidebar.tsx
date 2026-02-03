"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  FlaskConical,
  HelpCircle,
  Calendar,
  // BarChart3,
  Home,
  Users,
  Mail,
  FileInput,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, color: "text-blue-500" },
  { href: "/levels", label: "Levels", icon: Layers, color: "text-violet-500" },
  { href: "/subjects", label: "Subjects", icon: GraduationCap, color: "text-amber-500" },
  { href: "/topics", label: "Topics", icon: BookOpen, color: "text-emerald-500" },
  { href: "/notes", label: "Notes", icon: FileText, color: "text-sky-500" },
  { href: "/lab-reports", label: "Lab Reports", icon: FlaskConical, color: "text-pink-500" },
  { href: "/question-banks", label: "Question Banks", icon: HelpCircle, color: "text-orange-500" },
  { href: "/routines", label: "Routines", icon: Calendar, color: "text-teal-500" },
  // { href: "/results", label: "Results", icon: BarChart3, color: "text-indigo-500" },
  { href: "/users", label: "Users", icon: Users, color: "text-cyan-500" },
  { href: "/invitations", label: "Invitations", icon: Mail, color: "text-rose-500" },
  { href: "/submissions", label: "Submissions", icon: FileInput, color: "text-lime-600" },
];

export { navItems };

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="mb-8 px-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
            <FileText className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">NoteBot</h1>
            <p className="text-[10px] text-muted-foreground leading-none">Content Manager</p>
          </div>
        </div>
      </div>
      <nav className="space-y-0.5 flex-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_var(--color-primary)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : item.color)} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="w-60 border-r bg-card/80 backdrop-blur-sm min-h-screen py-4 flex flex-col">
      <SidebarContent />
    </aside>
  );
}
