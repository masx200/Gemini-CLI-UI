import jwt from "jsonwebtoken";
import express from "express";
import { userDb } from "../database/db.js";
const JWT_SECRET = process.env.JWT_SECRET || "qwen-ui-dev-secret-change-in-production";
const validateApiKey = (req, res, next) => {
    if (!process.env.API_KEY) {
        return next();
    }
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: "Invalid API key" });
    }
    next();
};
async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = userDb.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "Invalid token. User not found." });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).json({ error: "Invalid token" });
    }
}
const generateToken = (user) => {
    return jwt.sign({
        userId: user.id,
        username: user.username,
    }, JWT_SECRET);
};
const authenticateWebSocket = (token) => {
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        console.error("WebSocket token verification error:", error);
        return null;
    }
};
export { JWT_SECRET, authenticateToken, authenticateWebSocket, generateToken, validateApiKey, };
//# sourceMappingURL=auth.js.map