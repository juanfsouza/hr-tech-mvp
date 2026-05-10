import { api } from "@/lib/api";

export interface TestSessionResponse {
  token: string;
  portalUrl: string;
  expiresAt: string;
}

export interface TestSessionInput {
  candidateId: string;
  expiryHours?: number;
}

export const testService = {
  async createSession(input: TestSessionInput) {
    const { data } = await api.post<TestSessionResponse>("/tests/sessions", input);
    return data;
  },

  async getSession(token: string) {
    const { data } = await api.get(`/tests/portal/${token}`);
    return data;
  },
};
