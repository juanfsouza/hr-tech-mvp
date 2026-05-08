"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { BrainCircuit, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4"
          >
            <BrainCircuit className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-5xl font-bold font-outfit tracking-tight mb-4">
            Bem-vindo ao <span className="text-primary">SaaS RH</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A revolução no recrutamento baseada em ciência de dados e inteligência artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full border-primary/20 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-outfit">Portal da Empresa</CardTitle>
                <CardDescription>
                  Gerencie vagas, analise candidatos com IA e monte seu time de elite.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/onboarding">
                  <Button className="w-full group">
                    Iniciar Onboarding
                    <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full bg-secondary/20 backdrop-blur-sm border-transparent">
              <CardHeader>
                <BrainCircuit className="w-8 h-8 text-secondary-foreground mb-2" />
                <CardTitle className="text-2xl font-outfit">Área do Candidato</CardTitle>
                <CardDescription>
                  Realize os testes psicométricos e descubra seu fit com as melhores empresas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" disabled>
                  Acesse via link convite
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2026 SaaS RH AI. Todos os direitos reservados.</p>
        </footer>
      </motion.div>
    </div>
  );
}
