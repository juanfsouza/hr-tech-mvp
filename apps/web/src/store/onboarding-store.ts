import { create } from 'zustand';

interface OnboardingState {
  step: number;
  companyData: {
    name: string;
    cnpj: string;
    logo?: string;
    address?: {
      zipCode: string;
      street: string;
      number: string;
      city: string;
      state: string;
    };
  };
  setStep: (step: number) => void;
  updateCompanyData: (data: Partial<OnboardingState['companyData']>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  companyData: {
    name: '',
    cnpj: '',
  },
  setStep: (step) => set({ step }),
  updateCompanyData: (data) =>
    set((state) => ({
      companyData: { ...state.companyData, ...data },
    })),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
}));
