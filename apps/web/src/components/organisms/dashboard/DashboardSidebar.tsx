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
  { icon: MessageSquare, label: "Assistente de IA", href: "/dashboard/chat" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center shadow-lg shadow-neon/20">
            <Sparkles className="w-5 h-5 text-chumbo" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight">SaaS RH</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
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
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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

      <div className="p-4 space-y-4">
        <Separator className="bg-border/50" />
        <div className="px-2 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-azure/20 flex items-center justify-center font-bold text-azure">
              JS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Juan Silva</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </div>
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sair da conta
          </button>
        </div>
      </div>
    </aside>
  );
}
