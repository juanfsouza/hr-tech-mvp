"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { toast } from "sonner";
import Link from "next/link";
import {
  User,
  Building,
  Shield,
  Settings as SettingsIcon,
  Camera,
  ChevronRight,
  Lock,
  Globe,
  Mail,
  Send,
  ExternalLink
} from "lucide-react";
import { authService } from "@/services/auth-service";

const SidebarItem = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full mt-2 flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${active
      ? "bg-forest dark:bg-neon text-white dark:text-chumbo shadow-lg shadow-forest/20 dark:shadow-neon/20"
      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl transition-colors ${active ? "bg-white/20" : "bg-slate-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-neon/10"}`}>
        <Icon className={`w-5 h-5 ${active ? "text-white dark:text-chumbo" : "text-slate-500"}`} />
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
    <ChevronRight className={`w-4 h-4 transition-transform ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
  </button>
);

export default function SettingsPage() {
  const user = authService.getUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "profile", label: "Meu Perfil", icon: User },
    { id: "company", label: "Dados da Empresa", icon: Building },
    { id: "security", label: "Segurança", icon: Shield },
  ];

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      await authService.forgotPassword(user.email);
      toast.success("E-mail de recuperação enviado!", {
        description: "Enviamos um link para o seu e-mail corporativo."
      });
    } catch (error) {
      toast.error("Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-forest dark:text-neon">
            <SettingsIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Config</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-chumbo dark:text-white font-outfit tracking-tight">
            Configurações
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white dark:bg-card rounded-[32px] p-3 border border-slate-200/60 dark:border-white/5 shadow-sm">
              {tabs.map((tab) => (
                <SidebarItem
                  key={tab.id}
                  {...tab}
                  active={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <Card className="border-none bg-white dark:bg-card shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[32px] overflow-hidden">
                      <div className="p-8 md:p-10">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                          {/* Avatar Section */}
                          <div className="relative group mx-auto md:mx-0">
                            <div className="w-32 h-32 rounded-[40px] bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border-4 border-white dark:border-white/10 shadow-xl group-hover:scale-105 transition-transform duration-500">
                              {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-4xl font-black text-slate-300 dark:text-white/20">{user?.name?.charAt(0)}</div>
                              )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-3 bg-forest dark:bg-neon text-white dark:text-chumbo rounded-2xl shadow-lg hover:scale-110 transition-transform">
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Form Section */}
                          <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</Label>
                                <Input
                                  defaultValue={user?.name}
                                  className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus:ring-2 ring-forest/20 dark:ring-neon/20 font-medium"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</Label>
                                <div className="relative">
                                  <Input
                                    defaultValue={user?.email}
                                    disabled
                                    className="h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border-none opacity-60 font-medium pl-10"
                                  />
                                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo / Função</Label>
                                <Input
                                  defaultValue={user?.role || "Administrador de RH"}
                                  className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-none focus:ring-2 ring-forest/20 dark:ring-neon/20 font-medium"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-4">
                              <Button className="h-12 px-8 rounded-2xl bg-forest dark:bg-neon text-white dark:text-chumbo font-black text-[11px] tracking-widest uppercase shadow-lg shadow-forest/20 dark:shadow-neon/20">
                                Salvar Alterações
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === "company" && (
                  <div className="space-y-6">
                    <Card className="border-none bg-white dark:bg-card shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[32px] overflow-hidden">
                      <div className="p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-10">
                          <div className="p-3 bg-azure/10 rounded-2xl">
                            <Building className="w-6 h-6 text-azure" />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-chumbo dark:text-white font-outfit">Perfil Organizacional</h2>
                            <p className="text-sm text-muted-foreground">Gerencie a identidade da sua empresa na plataforma.</p>
                          </div>
                        </div>

                        {!user?.companyId ? (
                          <div className="p-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[40px] text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                              <Globe className="w-8 h-8 text-slate-300 dark:text-white/20" />
                            </div>
                            <div className="max-w-xs mx-auto">
                              <p className="font-bold text-chumbo dark:text-white">Nenhuma empresa vinculada</p>
                              <p className="text-xs text-muted-foreground mt-1">Configure o perfil da sua organização para liberar todas as funcionalidades.</p>
                            </div>
                            <Link href="/onboarding">
                              <Button className="mt-4 rounded-2xl bg-forest dark:bg-neon text-white dark:text-chumbo font-black text-[10px] tracking-widest uppercase px-8 h-12 flex items-center gap-2 mx-auto">
                                <ExternalLink className="w-3 h-3" />
                                Configurar Agora
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Fantasia</Label>
                              <Input placeholder="Carregando..." className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-medium" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CNPJ</Label>
                              <Input placeholder="00.000.000/0001-00" className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-medium" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Website Corporativo</Label>
                              <Input placeholder="https://suaempresa.com" className="h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-none font-medium" />
                            </div>
                            <div className="flex justify-end md:col-span-2 pt-4">
                              <Button className="h-12 px-8 rounded-2xl bg-forest dark:bg-neon text-white dark:text-chumbo font-black text-[11px] tracking-widest uppercase shadow-lg">
                                Atualizar Perfil
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Card className="border-none bg-white dark:bg-card shadow-2xl rounded-[32px] p-8 md:p-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-forest/10 dark:bg-neon/10 rounded-2xl text-forest dark:text-neon">
                          <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-chumbo dark:text-white font-outfit">Segurança da Conta</h2>
                      </div>

                      <div className="space-y-10 max-w-md">
                        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Send className="w-12 h-12 rotate-12" />
                          </div>
                          <h3 className="font-bold text-sm mb-2 dark:text-white">Redefinir Senha via E-mail</h3>
                          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Enviaremos um link seguro para o seu e-mail para que você possa criar uma nova senha com segurança.</p>
                          <Button
                            onClick={handleForgotPassword}
                            disabled={loading}
                            className="h-12 w-full rounded-2xl bg-forest dark:bg-neon text-white dark:text-chumbo font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
                          >
                            <Send className="w-3 h-3" />
                            {loading ? "PROCESSANDO..." : "SOLICITAR LINK AGORA"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=DM+Sans:wght@400;500;700;900&display=swap');
      `}</style>
    </DashboardLayout>
  );
}
