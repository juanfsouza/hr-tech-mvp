"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { authService } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register(data.name, data.email, data.password);
      toast.success("Conta criada com sucesso!", {
        description: "Agora você pode acessar sua conta.",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error("Erro ao realizar cadastro", {
        description: error.response?.data?.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite dark:bg-chumbo/10 p-4 md:p-8 font-outfit">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row-reverse w-full max-w-5xl bg-white dark:bg-card rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden min-h-[700px] border border-white/20"
      >

        {/* Lado Esquerdo (Invertido no Register para variar) - Estilo Imagem */}
        <div className="w-full md:w-[40%] bg-azure relative flex flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center gap-4 w-full">
            <div className="w-full flex flex-col gap-5">
              <Link href="/login" className="text-white/40 hover:text-white px-10 py-3.5 font-bold text-lg text-center transition-all hover:scale-105">
                LOGIN
              </Link>
              <div className="bg-white text-azure px-10 py-3.5 rounded-full font-bold text-lg shadow-xl text-center cursor-default">
                SIGN IN
              </div>
            </div>

            <div className="mt-20 text-white/20">
              <img src="/logo_black.png" alt="Logo" className="w-24 opacity-20 grayscale brightness-200" />
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-[60%] p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-card">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-azure/5 dark:bg-azure/5 rounded-2xl flex items-center justify-center mb-4 border border-azure/10">
              <img src="/logo_white.png" alt="Logo" className="w-10 h-10 object-contain dark:invert" />
            </div>
            <h2 className="text-2xl font-black text-azure tracking-[0.2em] uppercase">Cadastro</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-md mx-auto w-full">
            {/* Input de Nome */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute -top-5 left-0">Nome Completo</label>
              <User className="absolute left-0 bottom-3 w-5 h-5 text-slate-300 group-focus-within:text-azure transition-colors" />
              <input
                {...register("name")}
                placeholder="Seu Nome"
                className="w-full pl-8 pb-3 bg-transparent border-b-2 border-slate-100 dark:border-white/10 focus:border-azure outline-none transition-all placeholder:text-slate-300 text-slate-700 dark:text-white font-medium"
              />
              {errors.name && <span className="text-[10px] text-coral absolute -bottom-5 left-0 font-bold">{errors.name.message}</span>}
            </div>

            {/* Input de Email */}
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute -top-5 left-0">Email</label>
              <Mail className="absolute left-0 bottom-3 w-5 h-5 text-slate-300 group-focus-within:text-azure transition-colors" />
              <input
                {...register("email")}
                placeholder="seu@email.com"
                className="w-full pl-8 pb-3 bg-transparent border-b-2 border-slate-100 dark:border-white/10 focus:border-azure outline-none transition-all placeholder:text-slate-300 text-slate-700 dark:text-white font-medium"
              />
              {errors.email && <span className="text-[10px] text-coral absolute -bottom-5 left-0 font-bold">{errors.email.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input de Senha */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute -top-5 left-0">Password</label>
                <Lock className="absolute left-0 bottom-3 w-5 h-5 text-slate-300 group-focus-within:text-azure transition-colors" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-8 pb-3 bg-transparent border-b-2 border-slate-100 dark:border-white/10 focus:border-azure outline-none transition-all placeholder:text-slate-300 text-slate-700 dark:text-white font-medium"
                />
                {errors.password && <span className="text-[10px] text-coral absolute -bottom-5 left-0 font-bold">{errors.password.message}</span>}
              </div>

              {/* Confirmar Senha */}
              <div className="relative group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute -top-5 left-0">Confirm</label>
                <Lock className="absolute left-0 bottom-3 w-5 h-5 text-slate-300 group-focus-within:text-azure transition-colors" />
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-8 pb-3 bg-transparent border-b-2 border-slate-100 dark:border-white/10 focus:border-azure outline-none transition-all placeholder:text-slate-300 text-slate-700 dark:text-white font-medium"
                />
                {errors.confirmPassword && <span className="text-[10px] text-coral absolute -bottom-5 left-0 font-bold">{errors.confirmPassword.message}</span>}
              </div>
            </div>

            <div className="flex items-center justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-azure hover:bg-azure/90 text-white px-12 py-7 rounded-full font-black text-sm tracking-widest shadow-[0_15px_30px_-5px_rgba(123,179,176,0.4)] transition-all active:scale-95 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN"}
              </Button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400">
              Ao se cadastrar, você concorda com nossos <span className="text-azure font-bold cursor-pointer">Termos de Uso</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
