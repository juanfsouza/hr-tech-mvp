export interface StoredToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt: Date;
}
