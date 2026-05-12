"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D9999" strokeWidth="1.8">
    <circle cx="12" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D9999" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D9999" strokeWidth="1.8">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D9999" strokeWidth="1.8">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signin">("login");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle Google OAuth Redirect Callback
  useEffect(() => {
    const userParam = searchParams.get('user');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      toast.error("Erro no Google Login", {
        description: decodeURIComponent(errorParam)
      });
    }

    if (userParam) {
      try {
        const userData = JSON.parse(atob(userParam));
        localStorage.setItem('@SaaS:user', JSON.stringify(userData));
        toast.success(`Bem-vindo, ${userData.name}!`, {
          description: "Login via Google realizado com sucesso."
        });
        router.push("/dashboard");
      } catch (e) {
        // Erro Google Login silencioso
      }
    }
  }, [searchParams, router]);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.warning("Campos obrigatórios", {
        description: "Por favor, preencha e-mail e senha."
      });
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "login") {
        const response = await authService.login(email, password);
        if (response.accessToken) {
          setSuccess(true);
          toast.success("Bem-vindo de volta!", {
            description: "Acessando seu painel..."
          });
          router.push("/dashboard");
        }
      } else {
        if (!name) {
          toast.warning("Nome obrigatório", { description: "Por favor, preencha seu nome." });
          setLoading(false);
          return;
        }
        await authService.register(name, email, password);
        setSuccess(true);
        toast.success("Conta criada com sucesso!", {
          description: "Agora você já pode realizar o login."
        });
        setActiveTab("login");
        setSuccess(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Ocorreu um erro inesperado.";

      if (error.response?.status === 401) {
        toast.error("Credenciais inválidas", {
          description: "E-mail ou senha incorretos. Tente novamente."
        });
      } else if (error.response?.status === 409) {
        toast.error("Conflito no cadastro", {
          description: "Este e-mail já está sendo utilizado."
        });
      } else {
        toast.error("Erro na autenticação", {
          description: message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F0] p-4 md:p-8 font-dm-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1200px] rounded-[28px] shadow-[0_24px_64px_rgba(74,84,82,0.15)] flex flex-col md:flex-row min-h-[520px] overflow-hidden relative bg-white"
      >
        {/* ── PAINEL LATERAL ── */}
        <div className="w-full md:w-[35%] bg-gradient-to-br from-[#597048] to-[#4A5452] relative flex flex-col overflow-hidden p-8 md:p-0">

          <div className="hidden md:block">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#C4FF57] opacity-20 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-row md:flex-col gap-4 mt-0 md:mt-24 md:pl-10">
            {(["login", "signin"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <div key={tab} className="relative flex-1 md:flex-none">
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="absolute inset-0 md:-right-1 bg-white z-0 rounded-xl md:rounded-l-full md:rounded-r-none shadow-[-5px_0_20px_rgba(0,0,0,0.05)]"
                    >
                      <div className="hidden md:block absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-[20px] shadow-[5px_5px_0_0px_white]" />
                      <div className="hidden md:block absolute -bottom-5 right-0 w-5 h-5 bg-transparent rounded-tr-[20px] shadow-[5px_-5px_0_0px_white]" />
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => setActiveTab(tab)}
                    animate={{ color: isActive ? "#597048" : "rgba(255,255,255,0.7)" }}
                    className="relative z-10 w-full py-3 md:py-4 px-4 md:pl-8 text-[11px] md:text-[13px] font-black tracking-[0.2em] uppercase text-left transition-all"
                  >
                    {tab === "login" ? "ENTRAR" : "CADASTRO"}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PAINEL FORMULÁRIO ── */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 md:p-16">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            <div className="mb-8">
              <img src="/logo_black.png" alt="RH TECH" className="h-22 w-auto object-contain" />
            </div>

            <h1 className="text-xl md:text-2xl font-black text-[#597048] tracking-[0.25em] uppercase mb-8 md:mb-12 text-center">
              {activeTab === "login" ? "LOGIN" : "CRIAR CONTA"}
            </h1>

            <div className="w-full flex flex-col gap-6 md:gap-8">
              {activeTab === "signin" && (
                <div className="relative flex items-center border-b-2 border-[#F1F3F2] focus-within:border-[#C4FF57] transition-all">
                  <span className="absolute left-0"><UserIcon /></span>
                  <input
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 py-3 bg-transparent outline-none text-sm text-[#4A5452] font-medium"
                  />
                </div>
              )}

              <div className="relative flex items-center border-b-2 border-[#F1F3F2] focus-within:border-[#C4FF57] transition-all">
                <span className="absolute left-0"><EmailIcon /></span>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 py-3 bg-transparent outline-none text-sm text-[#4A5452] font-medium"
                />
              </div>

              <div className="relative flex items-center border-b-2 border-[#F1F3F2] focus-within:border-[#C4FF57] transition-all">
                <span className="absolute left-0"><LockIcon /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-10 py-3 bg-transparent outline-none text-sm text-[#4A5452] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col md:flex-row items-center justify-between mt-10 gap-6">
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#597048] opacity-70 hover:opacity-100 uppercase tracking-widest transition-colors"
              >
                Esqueceu a senha?
              </Link>

              <motion.button
                onClick={handleSubmit}
                disabled={loading || success}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full md:w-auto px-10 py-4 rounded-full font-black text-[11px] tracking-[0.2em] shadow-lg transition-colors ${success ? "bg-[#43c98a]" : "bg-[#597048] hover:bg-[#4A5452]"
                  } text-white`}
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (success ? "✓" : (activeTab === "login" ? "ENTRAR" : "CRIAR CONTA"))}
              </motion.button>
            </div>

            {/* Google Login Section */}
            <div className="mt-12 w-full border-t border-[#F1F3F2] pt-8 text-center">
              <p className="text-[9px] text-[#8D9999] font-black tracking-[0.2em] mb-6 uppercase">Ou entre com</p>
              <div className="flex justify-center">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-3 px-8 py-3 rounded-xl border border-[#F1F3F2] hover:bg-slate-50 transition-all text-xs font-bold text-[#4A5452]"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" width="16" alt="Google" />
                  Google
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap');
        ::placeholder { color: #8D9999; opacity: 0.5; }
      `}</style>
    </div>
  );
}
