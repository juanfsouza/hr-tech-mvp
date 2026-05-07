import { SaveTokenInput } from "../../application/interfaces/save-token-input.interface";
import { StoredToken } from "../interfaces/stored-token.interface";

export interface ITokenRepository {
    save(input: SaveTokenInput): Promise<void>;
    findByToken(token: string): Promise<StoredToken | null>;
    revoke(token: string): Promise<void>;
    revokeAllByUser(userId: string): Promise<void>;
    deleteExpired(): Promise<void>;
}
