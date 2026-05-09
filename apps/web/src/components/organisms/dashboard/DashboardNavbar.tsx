"use client";

import Link from "next/link";
import { authService } from "@/services/auth-service";
import { AnimatedThemeToggler } from "@/components/atoms/AnimatedThemeToggler";
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Bell
} from "lucide-react";
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

export function DashboardNavbar() {
  const user = authService.getUser();

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

  return (
    <header className="h-16 border-b border-border/20 bg-card/30 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon flex items-center justify-center shadow-lg shadow-neon/20">
            <Sparkles className="w-5 h-5 text-chumbo" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight">RH TECH</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full" />
        </Button>

        <AnimatedThemeToggler variant="circle" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 flex items-center gap-3 px-3 ml-2 rounded-full hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
              <div className="w-9 h-9 rounded-full bg-azure/20 flex items-center justify-center font-bold text-azure text-xs border border-azure/30 shadow-sm">
                {initials}
              </div>
              <div className="flex flex-col items-start hidden md:flex mr-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-70">{user?.role || "Membro"}</span>
                <span className="text-sm font-bold leading-none">{user?.name || "Usuário"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/50 p-2 shadow-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuGroup>
              <Link href="/dashboard/profile">
                <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-lg">
                  <UserIcon className="w-4 h-4 text-azure" /> Perfil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-lg text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Sair da conta
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
