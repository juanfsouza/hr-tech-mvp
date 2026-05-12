"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/atoms/button";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando seu e-mail...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação ausente.");
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await api.get(`/auth/verify?token=${token}`);
        setStatus("success");
        setMessage(data.message || "E-mail verificado com sucesso!");
      } catch (error) {
        const axiosError = error as any; // Using any for error property access in catch is a pragmatic middle ground here
        setStatus("error");
        setMessage(axiosError.response?.data?.message || "Token inválido ou expirado.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {status === "loading" && <Loader2 className="w-12 h-12 text-forest dark:text-neon animate-spin" />}
              {status === "success" && <CheckCircle2 className="w-12 h-12 text-forest dark:text-neon" />}
              {status === "error" && <XCircle className="w-12 h-12 text-destructive" />}
            </div>
            <CardTitle className="text-2xl font-bold font-outfit">
              {status === "loading" && "Verificando..."}
              {status === "success" && "E-mail Verificado!"}
              {status === "error" && "Erro na Verificação"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{message}</p>
            
            {status !== "loading" && (
              <Link href="/login" className="block w-full">
                <Button className="w-full h-12 bg-forest dark:bg-neon dark:text-chumbo font-bold text-lg">
                  Ir para Login
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest dark:border-neon border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
