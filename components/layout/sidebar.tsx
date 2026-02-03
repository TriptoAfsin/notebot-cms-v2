"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Layers,
  FileText,
  FlaskConical,
  HelpCircle,
  Calendar,
  BarChart3,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/levels", label: "Levels", icon: Layers },
  { href: "/subjects", label: "Subjects", icon: GraduationCap },
  { href: "/topics", label: "Topics", icon: BookOpen },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/lab-reports", label: "Lab Reports", icon: FlaskConical },
  { href: "/question-banks", label: "Question Banks", icon: HelpCircle },
  { href: "/routines", label: "Routines", icon: Calendar },
  { href: "/results", label: "Results", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">NoteBot CMS</h1>
        <p className="text-sm text-muted-foreground">Content Management</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
