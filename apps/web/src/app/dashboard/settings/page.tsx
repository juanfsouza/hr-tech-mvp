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
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <SettingsIcon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">Painel de Controle</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-outfit font-black text-slate-900 dark:text-white tracking-tight">
              Configurações
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie sua conta corporativa e preferências pessoais.
            </p>
          </div>
        </header>

        <Tabs defaultValue="profile" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className="bg-white/50 dark:bg-card/40 backdrop-blur-md p-1 border border-border/50 rounded-2xl w-full md:w-fit overflow-x-auto justify-start h-auto">
            <TabsTrigger value="profile" className="gap-2 px-6 py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all">
              <User className="w-4 h-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2 px-6 py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all">
              <Building className="w-4 h-4" /> Empresa
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-6 py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all">
              <Shield className="w-4 h-4" /> Segurança
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2 px-6 py-3 rounded-xl data-active:bg-white dark:data-active:bg-background shadow-sm transition-all">
              <CreditCard className="w-4 h-4" /> Assinatura
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <TabsContent value="profile" className="m-0 space-y-6">
                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold font-outfit">Informações do Perfil</CardTitle>
                    <CardDescription>Estes dados serão usados para identificação no sistema.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-slate-300" />
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input id="name" defaultValue={user?.name} className="rounded-xl h-12 bg-slate-50/50 dark:bg-background/50" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail Corporativo</Label>
                          <Input id="email" defaultValue={user?.email} disabled className="rounded-xl h-12 opacity-70" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Cargo</Label>
                          <Input id="role" defaultValue={user?.role || "Recrutador"} className="rounded-xl h-12 bg-slate-50/50 dark:bg-background/50" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button className="rounded-xl h-12 px-8 font-bold">Salvar Alterações</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold font-outfit">Preferências</CardTitle>
                    <CardDescription>Configure como você deseja interagir com a plataforma.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-background/50 rounded-2xl border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-azure/10">
                          <Bell className="w-5 h-5 text-azure" />
                        </div>
                        <div>
                          <p className="font-bold">Notificações por E-mail</p>
                          <p className="text-xs text-muted-foreground">Receba alertas sobre novos candidatos e matches.</p>
                        </div>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary/20 relative cursor-pointer">
                        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="m-0 space-y-6">
                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold font-outfit">Alterar Senha</CardTitle>
                    <CardDescription>Mantenha sua conta protegida com uma senha forte.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="current">Senha Atual</Label>
                        <Input id="current" type="password" placeholder="••••••••" className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new">Nova Senha</Label>
                        <Input id="new" type="password" placeholder="••••••••" className="rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" className="rounded-xl h-12 px-8 font-bold border-primary text-primary">Atualizar Senha</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="m-0">
                <Card className="border-none bg-white dark:bg-card/40 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold font-outfit">Dados da Empresa</CardTitle>
                    <CardDescription>Configure o perfil público da sua organização.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <p className="text-sm text-muted-foreground italic">Redirecionando para o módulo de Onboarding para edição completa...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            <div className="space-y-6">
              <Card className="border-none bg-primary text-white shadow-2xl rounded-3xl overflow-hidden relative group">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-white/10 blur-[60px] group-hover:bg-white/20 transition-all" />
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-neon" /> Segurança Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-white/80 leading-relaxed">
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

              <Card className="border-none bg-white dark:bg-card/40 shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg">Sessão Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Dispositivo</span>
                    <span className="font-bold">Navegador Atual</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Localização</span>
                    <span className="font-bold">São Paulo, BR</span>
                  </div>
                  <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 rounded-xl mt-2">
                    Encerrar Outras Sessões
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
