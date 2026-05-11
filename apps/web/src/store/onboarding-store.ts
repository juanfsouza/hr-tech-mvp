import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface OrganogramNode {
  id: string;
  name: string;
  role: string;
  department: string;
  parentId: string | null;
}

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
  organogram: OrganogramNode[];
  setStep: (step: number) => void;
  updateCompanyData: (data: Partial<OnboardingState['companyData']>) => void;
  setOrganogram: (nodes: OrganogramNode[]) => void;
  addOrganogramNode: (node: OrganogramNode) => void;
  removeOrganogramNode: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      companyData: {
        name: '',
        cnpj: '',
      },
      organogram: [],
      setStep: (step) => set({ step }),
      updateCompanyData: (data) =>
        set((state) => ({
          companyData: { ...state.companyData, ...data },
        })),
      setOrganogram: (nodes) => set({ organogram: nodes }),
      addOrganogramNode: (node) =>
        set((state) => ({ organogram: [...state.organogram, node] })),
      removeOrganogramNode: (id) =>
        set((state) => ({
          organogram: state.organogram.filter((n) => n.id !== id),
        })),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
    }),
    {
      name: '@SaaS:onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
