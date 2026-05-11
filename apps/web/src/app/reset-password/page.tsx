"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authService } from "@/services/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

const BrandLogo = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4L52 14V34L32 44L12 34V14L32 4Z" stroke="#C4FF57" strokeWidth="2.5" fill="none" />
    <path d="M32 4L32 24M32 24L12 14M32 24L52 14" stroke="#C4FF57" strokeWidth="2.5" />
    <path d="M22 19L32 24L42 19" stroke="#C4FF57" strokeWidth="2" />
    <path d="M32 24V44" stroke="#597048" strokeWidth="2.5" />
    <rect x="20" y="10" width="10" height="10" rx="2" stroke="#C4FF57" strokeWidth="2" fill="none" />
    <rect x="34" y="10" width="10" height="10" rx="2" stroke="#C4FF57" strokeWidth="2" fill="none" />
    <rect x="27" y="30" width="10" height="10" rx="2" stroke="#597048" strokeWidth="2" fill="none" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D9999" strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Token de recuperação ausente.");
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword || !token) return;
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      toast.success("Senha redefinida!", { 
        description: "Você já pode entrar com sua nova senha." 
      });
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      toast.error("Erro ao redefinir", {
        description: error.response?.data?.message || "O link pode ter expirado."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F0] p-4 md:p-8 font-dm-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[500px] rounded-[28px] shadow-[0_24px_64px_rgba(74,84,82,0.15)] overflow-hidden bg-white p-8 md:p-12 border border-[#F1F3F2]"
      >
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <img src="/logo_black.png" alt="RH TECH" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-[#597048] tracking-[0.25em] uppercase mt-0 mb-4 text-center">
            REDEFINIR SENHA
          </h1>
          <p className="text-sm text-[#8D9999] text-center mb-12">
            Escolha uma nova senha forte para sua conta.
          </p>

          <div className="w-full space-y-8">
            <div className="relative flex items-center border-b-2 border-[#F1F3F2] focus-within:border-[#C4FF57] transition-all">
              <span className="absolute left-0"><LockIcon /></span>
              <input
                type="password"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 py-3 bg-transparent outline-none text-sm text-[#4A5452] font-medium"
              />
            </div>

            <div className="relative flex items-center border-b-2 border-[#F1F3F2] focus-within:border-[#C4FF57] transition-all">
              <span className="absolute left-0"><LockIcon /></span>
              <input
                type="password"
                placeholder="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-8 py-3 bg-transparent outline-none text-sm text-[#4A5452] font-medium"
              />
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={loading || success}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-full font-black text-[11px] tracking-[0.2em] shadow-lg transition-colors ${
                success ? "bg-[#43c98a]" : "bg-[#597048] hover:bg-[#4A5452]"
              } text-white`}
            >
              {loading ? "PROCESSANDO..." : (success ? "SENHA ATUALIZADA" : "REDEFINIR AGORA")}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap');
        ::placeholder { color: #8D9999; opacity: 0.5; }
      `}</style>
    </div>
  );
}
