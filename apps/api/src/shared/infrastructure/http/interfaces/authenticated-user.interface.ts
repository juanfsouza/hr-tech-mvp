export interface AuthenticatedUser {
    id: string;
    sub: string;
    companyId?: string;
    email: string;
    role: 'ADMIN' | 'HR' | 'VIEWER';
}
