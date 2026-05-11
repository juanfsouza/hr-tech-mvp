export interface SyncOrganogramInput {
  companyId: string;
  nodes: {
    id: string; // ID temporário do frontend
    name: string;
    role: string;
    department?: string;
    parentId?: string | null;
  }[];
  personalityResults: Record<string, {
    disc?: string;
    enneagram?: string;
  }>;
}

export interface SyncOrganogramOutput {
  success: boolean;
  count: number;
}
