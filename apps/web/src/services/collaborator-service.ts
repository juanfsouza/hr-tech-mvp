import { api } from '@/lib/api';

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  email?: string;
  department?: string;
  parentId?: string;
}

export const collaboratorService = {
  async list(companyId: string) {
    const { data } = await api.get<Collaborator[]>(`/companies/${companyId}/collaborators`);
    return data;
  }
};
