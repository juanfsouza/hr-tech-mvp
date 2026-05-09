"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BrainCircuit,
  Settings,
  LogOut,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { Separator } from "@/components/atoms/separator";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
  { icon: Briefcase, label: "Gestão de Vagas", href: "/dashboard/jobs" },
  { icon: Users, label: "Candidatos", href: "/dashboard/candidates" },
  { icon: BrainCircuit, label: "Motor de Testes", href: "/dashboard/tests" },
  { icon: Sparkles, label: "Assistente IA", href: "/dashboard/chat" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-border dark:border-slate-200/5 bg-white dark:bg-card/30 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
      <nav className="flex-1 px-4 py-8 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-forest/10 dark:bg-neon/10 text-forest dark:text-neon shadow-sm"
                  : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted/50 hover:text-slate-900 dark:hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-forest dark:text-neon" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
