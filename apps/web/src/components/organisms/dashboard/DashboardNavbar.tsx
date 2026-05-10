"use client";

import Link from "next/link";
import { authService } from "@/services/auth-service";
import { AnimatedThemeToggler } from "@/components/atoms/AnimatedThemeToggler";
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Bell,
  LayoutDashboard,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { KineticText } from "@/components/atoms/KineticText";
import { motion } from "framer-motion";

export function DashboardNavbar() {
  const user = authService.getUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
  };

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "??";

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => dashboardService.getNotifications(),
    refetchInterval: 30000, // Atualizar a cada 30s
  });

  const hasNotifications = notifications && notifications.length > 0;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-border/10 bg-white/80 dark:bg-card/30 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {/* Logo para Modo Claro (Texto Preto) */}
            <img
              src="/logo_white.png"
              alt="RH TECH Logo"
              className="w-full h-full object-contain dark:hidden drop-shadow-sm"
            />
            {/* Logo para Modo Escuro (Texto Branco) */}
            <img
              src="/logo_black.png"
              alt="RH TECH Logo"
              className="w-full h-full object-contain hidden dark:block drop-shadow-[0_0_8px_rgba(196,255,87,0.3)]"
            />
          </div>
          <KineticText
            text="RH TECH"
            as="span"
            className="font-outfit font-bold text-xl tracking-tight text-slate-900 dark:text-white"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!user?.companyId && (
          <Link href="/onboarding">
            <Button variant="outline" className="hidden md:flex items-center gap-2 border-azure/30 text-azure hover:bg-azure/10 rounded-full font-bold px-4 h-10 transition-all group">
              <LayoutDashboard className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Finalizar Configuração
            </Button>
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-full bg-transparent hover:bg-primary/30 dark:hover:bg-muted/50 relative hover:bg-slate-100 dark:hover:bg-muted/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-600 dark:text-foreground" />
              {mounted && hasNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-white dark:border-chumbo animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-border/50 p-2 shadow-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex justify-between items-center p-2">
                <span className="font-bold">Notificações</span>
                {mounted && hasNotifications && <Badge variant="secondary" className="bg-coral/10 text-coral border-none">{notifications.length}</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-border/50" />
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                {hasNotifications ? (
                  notifications.map((notif) => (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-muted cursor-default border-b border-slate-50 dark:border-border/10 last:border-0">
                      <div className="flex items-center gap-2 w-full">
                        <div className="bg-forest/10 p-1.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{notif.action}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-tight">
                        {notif.details}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 dark:text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground italic">
                    Nenhuma notificação nova.
                  </div>
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <AnimatedThemeToggler variant="circle" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-3 ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-muted/50 transition-all border border-transparent hover:border-slate-200 dark:hover:border-border/50">
              <div className="w-9 h-9 rounded-full bg-azure/10 dark:bg-azure/20 flex items-center justify-center font-bold text-azure text-xs border border-azure/20 dark:border-azure/30 shadow-sm">
                {initials}
              </div>
              <div className="flex flex-col items-start hidden md:flex mr-2">
                <span className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase tracking-widest font-bold opacity-80">{user?.role || "Membro"}</span>
                <span className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user?.name || "Usuário"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-border/50 p-2 shadow-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-border/50" />
            <DropdownMenuGroup>
              <Link href="/dashboard/profile">
                <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-lg text-slate-700 dark:text-foreground hover:bg-slate-100 dark:hover:bg-muted">
                  <UserIcon className="w-4 h-4 text-azure" /> Perfil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="gap-2 cursor-pointer py-2.5 rounded-lg text-destructive focus:text-destructive hover:bg-destructive/5"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Sair da conta
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
