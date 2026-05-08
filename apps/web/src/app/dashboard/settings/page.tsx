"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Settings, User, Building, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-outfit tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie sua conta, empresa e preferências do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-muted">
            <User className="w-5 h-5" /> Perfil
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Building className="w-5 h-5" /> Empresa
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Shield className="w-5 h-5" /> Segurança
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Bell className="w-5 h-5" /> Notificações
          </Button>
        </aside>

        <div className="md:col-span-3 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <CardDescription>Informações básicas da sua conta de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">Página em construção...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper local
function Button({ children, variant, className, ...props }: any) {
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'ghost' ? 'hover:bg-muted' : 'bg-primary text-primary-foreground'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
