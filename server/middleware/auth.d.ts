import jwt from "jsonwebtoken";
import express from "express";
declare const JWT_SECRET: string;
declare const validateApiKey: (req: {
    headers: {
        [x: string]: any;
    };
}, res: {
    status: (arg0: number) => {
        (): any;
        new (): any;
        json: {
            (arg0: {
                error: string;
            }): any;
            new (): any;
        };
    };
}, next: () => void) => any;
declare function authenticateToken(req: express.Request, res: express.Response, next: () => void): Promise<express.Response<any, Record<string, any>> | undefined>;
declare const generateToken: (user: {
    id: any;
    username: any;
}) => string;
declare const authenticateWebSocket: (token: string) => string | jwt.JwtPayload | null;
export { JWT_SECRET, authenticateToken, authenticateWebSocket, generateToken, validateApiKey, };
//# sourceMappingURL=auth.d.ts.map