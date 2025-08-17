export declare class Crypto<T extends object> {
    secret: string;
    constructor(secret: string);
    encrypt(data: T): string;
    decrypt(encrypted: string): T | null;
}
//# sourceMappingURL=crypto.d.ts.map