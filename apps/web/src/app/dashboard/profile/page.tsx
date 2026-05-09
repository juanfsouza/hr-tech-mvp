"use client";

import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { authService } from "@/services/auth-service";
import { User, Mail, Shield, Building, Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const user = authService.getUser();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais e preferências de conta.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lado Esquerdo: Resumo */}
          <Card className="lg:col-span-1 border-slate-200 dark:border-border/50 bg-white dark:bg-card/50 backdrop-blur-sm shadow-sm">
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-azure/10 border-2 border-azure/30 flex items-center justify-center text-4xl font-bold text-azure shadow-xl shadow-azure/10 group-hover:border-azure/50 transition-all">
                  {user?.name?.substring(0, 1).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-background border border-slate-200 dark:border-border rounded-full shadow-lg hover:scale-110 transition-all text-slate-400 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-azure uppercase tracking-widest text-[10px] font-bold mt-1 bg-azure/10 px-3 py-1 rounded-full border border-azure/20">
                {user?.role || "Membro"}
              </p>

              <div className="w-full mt-8 space-y-4 text-slate-600 dark:text-muted-foreground">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm border border-slate-100 dark:border-transparent">
                  <Mail className="w-4 h-4 text-azure" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-muted/30 text-sm border border-slate-100 dark:border-transparent">
                  <Shield className="w-4 h-4 text-forest dark:text-neon" />
                  <span>Conta Verificada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lado Direito: Detalhes e Edição */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 dark:border-border/50 bg-white dark:bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="font-outfit text-2xl text-slate-900 dark:text-white">Dados Pessoais</CardTitle>
                <CardDescription className="text-slate-500 dark:text-muted-foreground">Mantenha seus dados atualizados para uma melhor experiência.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Nome Completo</label>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-border/50 bg-slate-50/50 dark:bg-background/50 focus-within:border-forest/50 transition-all">
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">E-mail Corporativo</label>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-border/50 bg-slate-50/50 dark:bg-background/20 cursor-not-allowed">
                      <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="w-full bg-transparent outline-none text-sm opacity-50 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Cargo / Função</label>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-border/50 bg-slate-50/50 dark:bg-background/50 focus-within:border-forest/50 transition-all">
                      <input
                        type="text"
                        defaultValue={user?.role}
                        className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-muted-foreground">ID da Empresa</label>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-border/50 bg-slate-50/50 dark:bg-background/20 cursor-not-allowed">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 opacity-30 text-slate-900 dark:text-white" />
                        <span className="text-sm opacity-50 font-mono text-[10px] text-slate-900 dark:text-white">{user?.companyId || "Não vinculada"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button className="bg-neon text-slate-900 dark:text-chumbo font-bold px-8 hover:bg-neon/90 transition-all shadow-lg shadow-neon/10">
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-destructive/20">
              <CardHeader>
                <CardTitle className="font-outfit text-2xl text-destructive/80">Zona de Perigo</CardTitle>
                <CardDescription>Ações irreversíveis relacionadas à sua conta.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col m-2 md:flex-row items-center justify-between gap-4 p-6 bg-destructive/5 rounded-xl border border-destructive/10">
                <div>
                  <h4 className="font-bold">Desativar minha conta</h4>
                  <p className="text-xs text-muted-foreground">Isso ocultará seu perfil e suspenderá seu acesso temporariamente.</p>
                </div>
                <Button variant="destructive" className="font-bold whitespace-nowrap">
                  Desativar Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
