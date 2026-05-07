export interface LoginOutput {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        companyId?: string;
        avatarUrl?: string;
        };
}
