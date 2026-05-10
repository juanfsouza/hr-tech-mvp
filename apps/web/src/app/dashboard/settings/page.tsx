"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { 
  User, 
  Building, 
  Shield, 
  Bell, 
  Settings as SettingsIcon,
  CreditCard,
  Mail,
  Lock,
  Globe,
  Camera
} from "lucide-react";
import { authService } from "@/services/auth-service";

export default function SettingsPage() {
  const user = authService.getUser();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <SettingsIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Painel de Controle</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-outfit font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Configurações
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg">
              Gerencie sua conta corporativa e preferências pessoais.
            </p>
          </div>
        </header>

        <Tabs defaultValue="profile" className="space-y-6 md:space-y-8" onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
            <TabsList className="bg-white/50 dark:bg-card/40 backdrop-blur-md p-1 border border-border/50 rounded-2xl w-max md:w-fit flex h-auto">
              <TabsTrigger value="profile" className="gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all text-xs md:text-sm">
                <User className="w-4 h-4" /> Perfil
              </TabsTrigger>
              <TabsTrigger value="company" className="gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all text-xs md:text-sm">
                <Building className="w-4 h-4" /> Empresa
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all text-xs md:text-sm">
                <Shield className="w-4 h-4" /> Segurança
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all text-xs md:text-sm">
                <CreditCard className="w-4 h-4" /> Assinatura
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-8 space-y-6">
              <TabsContent value="profile" className="m-0 space-y-6 outline-none">
                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-6 md:p-8 pb-2 md:pb-4">
                    <CardTitle className="text-xl md:text-2xl font-bold font-outfit">Informações do Perfil</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Estes dados serão usados para identificação no sistema.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-4 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                      <div className="relative group shrink-0">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 md:w-12 md:h-12 text-slate-300" />
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
                        <div className="space-y-2 text-left">
                          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400">Nome Completo</Label>
                          <Input id="name" defaultValue={user?.name} className="rounded-xl h-11 md:h-12 bg-slate-50/50 dark:bg-background/50 border-slate-200/60" />
                        </div>
                        <div className="space-y-2 text-left">
                          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">E-mail Corporativo</Label>
                          <Input id="email" defaultValue={user?.email} disabled className="rounded-xl h-11 md:h-12 opacity-70 bg-slate-100/50" />
                        </div>
                        <div className="sm:col-span-2 space-y-2 text-left">
                          <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-slate-400">Cargo / Função</Label>
                          <Input id="role" defaultValue={user?.role || "Recrutador Especialista"} className="rounded-xl h-11 md:h-12 bg-slate-50/50 dark:bg-background/50 border-slate-200/60" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center md:justify-end pt-4 border-t border-slate-100 dark:border-white/5">
                      <Button className="w-full md:w-auto rounded-xl h-12 px-10 font-bold shadow-lg shadow-primary/20">Salvar Alterações</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-6 md:p-8 pb-2 md:pb-4">
                    <CardTitle className="text-xl md:text-2xl font-bold font-outfit">Preferências</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Configure como você deseja interagir com a plataforma.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 bg-slate-50/50 dark:bg-background/50 rounded-2xl border border-slate-100 dark:border-white/5 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-azure/10 shrink-0">
                          <Bell className="w-5 h-5 text-azure" />
                        </div>
                        <div>
                          <p className="font-bold text-sm md:text-base">Notificações por E-mail</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">Receba alertas sobre novos candidatos e matches.</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary/20 relative cursor-pointer ml-auto sm:ml-0">
                        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="m-0 space-y-6 outline-none">
                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-6 md:p-8 pb-2 md:pb-4">
                    <CardTitle className="text-xl md:text-2xl font-bold font-outfit">Alterar Senha</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Mantenha sua conta protegida com uma senha forte.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-4 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Senha Atual</Label>
                        <Input id="current" type="password" placeholder="••••••••" className="rounded-xl h-11 md:h-12 bg-slate-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nova Senha</Label>
                        <Input id="new" type="password" placeholder="••••••••" className="rounded-xl h-11 md:h-12 bg-slate-50/50" />
                      </div>
                    </div>
                    <div className="flex justify-center md:justify-end">
                      <Button variant="outline" className="w-full md:w-auto rounded-xl h-11 md:h-12 px-10 font-bold border-primary text-primary hover:bg-primary/5">Atualizar Senha</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="m-0 outline-none">
                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-6 md:p-8 pb-2 md:pb-4">
                    <CardTitle className="text-xl md:text-2xl font-bold font-outfit">Dados da Empresa</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Configure o perfil público da sua organização.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-4">
                    <div className="p-6 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl text-center">
                      <Building className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Módulo de edição em fase de sincronização com o Onboarding.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none bg-primary text-white shadow-2xl rounded-3xl overflow-hidden relative group">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-white/10 blur-[60px] group-hover:bg-white/20 transition-all" />
                <CardHeader className="p-6 md:p-8">
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-neon" /> Segurança Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 pt-0 space-y-4">
                  <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                    Sua conta está protegida por criptografia de ponta a ponta e autenticação segura via Cookies HttpOnly.
                  </p>
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Status da Conexão</span>
                    </div>
                    <p className="text-xs font-bold">Criptografia Ativa (SSL/TLS)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white dark:bg-card/40 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="p-6 md:p-8">
                  <CardTitle className="text-base md:text-lg">Sessão Atual</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 pt-0 space-y-4 text-xs md:text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-muted-foreground">Dispositivo</span>
                    <span className="font-bold">Chrome / MacOS</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-muted-foreground">Localização</span>
                    <span className="font-bold">São Paulo, BR</span>
                  </div>
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-xl mt-2 h-11 text-xs font-bold uppercase tracking-widest">
                    Encerrar Sessão
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
