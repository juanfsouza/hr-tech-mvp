"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { BrainCircuit, Users, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center justify-center p-4 rounded-3xl bg-neon/20 mb-6 border border-neon/30"
          >
            <Zap className="w-12 h-12 text-neon" />
          </motion.div>
          
          <h1 className="text-6xl font-bold font-outfit tracking-tight mb-6 leading-tight">
            SaaS de RH com <br />
            <span className="text-neon drop-shadow-[0_0_15px_rgba(196,255,87,0.3)]">Psicometria & IA</span>
          </h1>
          
          <p className="text-xl text-chumbo/80 dark:text-offwhite/70 max-w-2xl mx-auto font-light">
            Recrutamento inteligente com motor próprio de testes <span className="font-semibold text-forest dark:text-azure">DISC, Eneagrama e 16P</span>. 
            Sem custos por aplicação, 100% data-driven.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="h-full border-forest/20 dark:border-neon/20 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-forest/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-forest text-offwhite flex items-center justify-center mb-4 shadow-lg shadow-forest/20">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-outfit text-forest dark:text-neon">Portal da Empresa</CardTitle>
                <CardDescription className="text-chumbo/70 dark:text-gray-brand">
                  Publique vagas, analise o match cultural dos candidatos e receba insights do assistente de IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <Link href="/onboarding">
                  <Button className="w-full bg-forest hover:bg-forest/90 dark:bg-neon dark:text-chumbo dark:hover:bg-neon/90 font-bold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-forest/10 dark:shadow-neon/10">
                    Começar Onboarding
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="h-full border-azure/20 bg-offwhite/50 dark:bg-chumbo/30 backdrop-blur-md shadow-xl overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-coral/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-azure text-offwhite flex items-center justify-center mb-4 shadow-lg shadow-azure/20">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-outfit text-azure">Portal do Candidato</CardTitle>
                <CardDescription className="text-chumbo/70 dark:text-gray-brand">
                  Interface white-label com a marca da sua empresa para uma experiência de teste fluida e profissional.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <Button variant="outline" className="w-full border-azure/30 text-azure hover:bg-azure/10 font-semibold h-12 rounded-xl" disabled>
                  Acesso via Link de Vaga
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-chumbo/10 dark:border-offwhite/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-chumbo/60 dark:text-gray-brand"
        >
          <div className="flex gap-6">
            <span>Stack: Bun + Next.js 14</span>
            <span>IA: Claude 3.5 Sonnet</span>
          </div>
          <p>© 2026 SaaS RH Intelligence.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
