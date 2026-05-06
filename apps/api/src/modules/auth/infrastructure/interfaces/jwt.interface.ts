export interface JwtPayload {
    sub: string;
    email: string;
    companyId: string;
    role: 'ADMIN' | 'HR' | 'VIEWER';
    iat: number;
    exp: number;
}