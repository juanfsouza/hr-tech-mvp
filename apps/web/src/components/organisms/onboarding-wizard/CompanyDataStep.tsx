"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { useOnboardingStore } from "@/store/onboarding-store";
import { companyService } from "@/services/company-service";
import { authService } from "@/services/auth-service";
import { useMutation } from "@tanstack/react-query";
import { Building2, MapPin, Globe, Loader2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const companySchema = z.object({
  name: z.string().min(3, "Razão social deve ter pelo menos 3 caracteres"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyDataStep() {
  const { companyData, updateCompanyData, nextStep } = useOnboardingStore();
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const user = authService.getUser();

  const mutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const companyId = user?.companyId;

      if (companyId) {
        const company = await companyService.update(companyId, {
          razaoSocial: data.name,
          cnpj: data.cnpj,
          websiteUrl: data.website || undefined,
        });
        return {
          companyId: company.id,
          cnpj: company.cnpj,
          razaoSocial: company.razaoSocial,
        };
      }

      return companyService.create({
        razaoSocial: data.name,
        cnpj: data.cnpj,
        websiteUrl: data.website || undefined,
        userId: user!.id,
      });
    },
    onSuccess: async (data: { companyId: string; cnpj: string; razaoSocial: string }) => {
      toast.success(user?.companyId ? "Dados atualizados!" : "Empresa cadastrada!");
      
      const isNewCompany = user && !user.companyId;

      if (isNewCompany) {
        const updatedUser = { ...user, companyId: data.companyId };
        localStorage.setItem('@SaaS:user', JSON.stringify(updatedUser));
        
        try {
          console.log('[Onboarding] Iniciando refresh de token após criação de empresa...');
          await authService.refreshToken();
        } catch (err) {
          console.error("[Onboarding] Falha crítica ao atualizar token:", err);
          toast.error("Sua sessão não pôde ser sincronizada. Recarregue a página ou faça login novamente.");
          return; // NÃO prossegue se falhou na criação inicial
        }
      }
      
      updateCompanyData({
        id: data.companyId || user?.companyId,
        name: data.razaoSocial,
        cnpj: data.cnpj
      });
      
      nextStep();
    },
    onError: (error: Error) => {
      const axiosError = error as any;
      toast.error("Erro ao salvar empresa", {
        description: axiosError.response?.data?.message || "Tente novamente.",
      });
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: companyData.name,
      cnpj: companyData.cnpj,
      zipCode: companyData.address?.zipCode,
      street: companyData.address?.street,
      number: companyData.address?.number,
      city: companyData.address?.city,
      state: companyData.address?.state,
    },
    mode: "onChange",
  });

  // Atualizar formulário quando o store mudar (ex: após fetch no page.tsx)
  useEffect(() => {
    const hasData = companyData.name || companyData.cnpj || companyData.address?.zipCode;
    if (hasData) {
      reset({
        name: companyData.name || "",
        cnpj: companyData.cnpj || "",
        zipCode: companyData.address?.zipCode || "",
        street: companyData.address?.street || "",
        number: companyData.address?.number || "",
        city: companyData.address?.city || "",
        state: companyData.address?.state || "",
      }, { keepDefaultValues: false });
    }
  }, [companyData, reset]);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue("street", data.logradouro);
          setValue("city", data.localidade);
          setValue("state", data.uf);
          document.getElementById("number")?.focus();
        }
      } catch (error) {
        // Error silent
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const onSubmit = (data: CompanyFormData) => {
    updateCompanyData({
      name: data.name,
      cnpj: data.cnpj,
      address: {
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        city: data.city,
        state: data.state,
      },
    });
    mutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-slate-200 dark:border-border/50 bg-white dark:bg-card/50 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">Razão Social</Label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon transition-colors" />
                  <Input
                    id="name"
                    placeholder="Ex: Acme Corp Ltda"
                    {...register("name")}
                    className={cn(
                      "pl-10 h-12 bg-slate-50/50 dark:bg-background/50 border-slate-200 dark:border-border/50 focus:border-neon/50 transition-all",
                      errors.name ? "border-destructive focus:border-destructive" : ""
                    )}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="cnpj" className="text-slate-700 dark:text-slate-300 font-semibold">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  {...register("cnpj")}
                  className={cn(
                    "h-12 bg-slate-50/50 dark:bg-background/50 border-slate-200 dark:border-border/50 focus:border-neon/50 transition-all",
                    errors.cnpj ? "border-destructive focus:border-destructive" : ""
                  )}
                />
                {errors.cnpj && <p className="text-xs text-destructive font-medium">{errors.cnpj.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="website" className="text-slate-700 dark:text-slate-300 font-semibold">Website (Opcional)</Label>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-neon transition-colors" />
                <Input
                  id="website"
                  placeholder="https://suaempresa.com"
                  className="pl-10 h-12 bg-slate-50/50 dark:bg-background/50 border-slate-200 dark:border-border/50 focus:border-neon/50 transition-all"
                  {...register("website")}
                />
              </div>
              {errors.website && <p className="text-xs text-destructive font-medium">{errors.website.message}</p>}
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-3xl border border-slate-200/60 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold text-lg mb-2">
                <div className="p-2 rounded-lg bg-azure/10 dark:bg-neon/10">
                  <MapPin className="w-5 h-5 text-azure dark:text-neon" />
                </div>
                Endereço Sede
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-slate-500">CEP</Label>
                  <div className="relative">
                    <Input
                      id="zipCode"
                      placeholder="00000-000"
                      {...register("zipCode")}
                      onBlur={handleCepBlur}
                      className="h-11 bg-white dark:bg-background border-slate-200 dark:border-border/50"
                    />
                    {isFetchingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-neon" />
                    )}
                  </div>
                  {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street" className="text-sm font-medium text-slate-500">Logradouro</Label>
                  <Input id="street" {...register("street")} className="h-11 bg-white dark:bg-background border-slate-200 dark:border-border/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-sm font-medium text-slate-500">Número</Label>
                  <Input id="number" {...register("number")} className="h-11 bg-white dark:bg-background border-slate-200 dark:border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-slate-500">Cidade</Label>
                  <Input id="city" {...register("city")} className="h-11 bg-white dark:bg-background border-slate-200 dark:border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-slate-500">Estado (UF)</Label>
                  <Input id="state" {...register("state")} className="h-11 bg-white dark:bg-background border-slate-200 dark:border-border/50" />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button 
                type="submit" 
                className="w-full md:w-auto min-w-[240px] h-14 text-lg font-bold bg-neon text-slate-900 hover:bg-neon/90 transition-all shadow-lg shadow-neon/20 rounded-2xl gap-3"
                disabled={!isValid || isFetchingCep || mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Próxima Etapa: Estrutura
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
