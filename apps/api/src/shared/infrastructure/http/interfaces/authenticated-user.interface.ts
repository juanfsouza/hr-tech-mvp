export interface AuthenticatedUser {
    sub: string;
    companyId: string;
    email: string;
    role: 'ADMIN' | 'HR' | 'VIEWER';
}
