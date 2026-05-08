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
import { useState } from "react";
import { toast } from "sonner";

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

  const mutation = useMutation({
    mutationFn: (data: CompanyFormData) => {
      const user = authService.getUser();
      return companyService.create({
        razaoSocial: data.name,
        cnpj: data.cnpj,
        websiteUrl: data.website,
        userId: user.id,
      });
    },
    onSuccess: (data) => {
      toast.success("Empresa cadastrada com sucesso!");
      
      // Atualizar o usuário no localStorage para refletir a nova empresa imediatamente
      const currentUser = authService.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, companyId: data.companyId };
        localStorage.setItem('@SaaS:user', JSON.stringify(updatedUser));
      }
      
      updateCompanyData({
        name: data.razaoSocial,
      });
      nextStep();
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar empresa", {
        description: error.response?.data?.message || "Tente novamente.",
      });
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
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
        console.error("Erro ao buscar CEP:", error);
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-outfit text-forest dark:text-neon flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Dados da Empresa
          </CardTitle>
          <CardDescription className="text-lg">
            Comece nos contando o básico sobre sua organização.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Razão Social</Label>
                <Input
                  id="name"
                  placeholder="Ex: Acme Corp Ltda"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  {...register("cnpj")}
                  className={errors.cnpj ? "border-destructive" : ""}
                />
                {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Opcional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  placeholder="https://suaempresa.com"
                  className="pl-10"
                  {...register("website")}
                />
              </div>
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>

            <div className="bg-forest/5 dark:bg-neon/5 p-6 rounded-2xl border border-forest/10 dark:border-neon/10 space-y-4">
              <div className="flex items-center gap-2 text-forest dark:text-neon font-semibold mb-2">
                <MapPin className="w-5 h-5" />
                Endereço Sede
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <div className="relative">
                    <Input
                      id="zipCode"
                      placeholder="00000-000"
                      {...register("zipCode")}
                      onBlur={handleCepBlur}
                    />
                    {isFetchingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                    )}
                  </div>
                  {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input id="street" {...register("street")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" {...register("number")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" {...register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input id="state" {...register("state")} />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-forest dark:bg-neon dark:text-chumbo"
                disabled={!isValid || isFetchingCep}
              >
                Próxima Etapa: Organograma
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
