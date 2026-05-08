"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { ClipboardCheck, Brain, Layout, BarChart } from "lucide-react";

export default function TestsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-outfit tracking-tight">Instrumentos Psicométricos</h1>
        <p className="text-muted-foreground mt-2">Configure os pesos e visualize a estrutura das avaliações.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: "DISC", icon: Brain, color: "text-blue-500" },
          { name: "Eneagrama", icon: Layout, color: "text-purple-500" },
          { name: "16 Personalidades", icon: BarChart, color: "text-green-500" }
        ].map((test) => (
          <Card key={test.name} className="bg-card/50 border-border/50">
            <CardHeader>
              <test.icon className={`w-10 h-10 mb-2 ${test.color}`} />
              <CardTitle>{test.name}</CardTitle>
              <CardDescription>Configurações globais do instrumento.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">Em construção...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
