"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { authService } from "@/services/auth-service";
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

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D9999" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.success("E-mail enviado!", { 
        description: "Se o e-mail estiver cadastrado, você receberá um link de recuperação." 
      });
    } catch (error: any) {
      toast.error("Erro ao processar", {
        description: "Tente novamente mais tarde."
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
            RECUPERAR SENHA
          </h1>
          <p className="text-sm text-[#8D9999] text-center mb-12">
            Insira seu e-mail para receber um link de redefinição de senha.
          </p>

          <div className="w-full space-y-8">
            <div className="relative flex items-center border-b-2 border-[#F1F3F2] focus-within:border-[#C4FF57] transition-all">
              <span className="absolute left-0"><EmailIcon /></span>
              <input
                type="email"
                placeholder="Seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "ENVIANDO..." : (success ? "E-MAIL ENVIADO" : "ENVIAR LINK")}
            </motion.button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-[11px] font-bold text-[#597048] opacity-70 hover:opacity-100 uppercase tracking-widest transition-colors">
                Voltar para o Login
              </Link>
            </div>
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
