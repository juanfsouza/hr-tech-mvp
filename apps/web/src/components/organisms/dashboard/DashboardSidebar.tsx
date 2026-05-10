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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { useState, useEffect } from "react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
  { icon: Rocket, label: "Onboarding", href: "/onboarding" },
  { icon: Briefcase, label: "Gestão de Vagas", href: "/dashboard/jobs" },
  { icon: Users, label: "Candidatos", href: "/dashboard/candidates" },
  { icon: BrainCircuit, label: "Portal de Testes", href: "/dashboard/tests" },
  { icon: Sparkles, label: "Assistente IA", href: "/dashboard/chat" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir erro de hidratação: renderizar largura padrão no servidor
  const currentWidth = !mounted ? 80 : (isSidebarCollapsed ? 80 : 256);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: currentWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => setSidebarCollapsed(false)}
      onMouseLeave={() => setSidebarCollapsed(true)}
      className="border-r border-slate-200 dark:border-white/5 bg-white dark:bg-card/30 backdrop-blur-xl h-screen sticky top-0 flex flex-col z-30 group/sidebar"
    >
      <nav className="flex-1 px-3 py-8 space-y-2 overflow-x-hidden">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl m-1 transition-all duration-200 group relative",
                  isActive 
                    ? "bg-neon text-slate-900 shadow-lg shadow-neon/70 dark:shadow-neon/50 font-bold" 
                    : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-slate-900" : "group-hover:text-forest dark:group-hover:text-neon")} />
                
                <AnimatePresence mode="wait">
                  {(!isSidebarCollapsed && mounted) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {(isSidebarCollapsed && mounted) && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
