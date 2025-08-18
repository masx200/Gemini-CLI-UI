import jwt from "jsonwebtoken";
//@ts-ignore
import { userDb } from "../database/db.js";
import express from "express";

// Get JWT secret from environment or use default (for development)
//@ts-ignore
const JWT_SECRET =

//@ts-ignore
  process.env.JWT_SECRET || "gemini-ui-dev-secret-change-in-production";

// Optional API key middleware
const validateApiKey = (
  req: { headers: { [x: string]: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error: string }): any; new (): any };
    };
  },
  next: () => void
) => {
  // Skip API key validation if not configured
  //@ts-ignore
  if (!process.env.API_KEY) {
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  //@ts-ignore
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
};

// JWT authentication middleware
//@ts-ignore
async function authenticateToken(
  req: express.Request,
  res: express.Response,
  next: () => void
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists and is active
    //@ts-ignore
    const user = userDb.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }
//@ts-ignore
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
}

// Generate JWT token (never expires)
const generateToken = (user: { id: any; username: any }) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    JWT_SECRET
    // No expiration - token lasts forever
  );
};

// WebSocket authentication function
const authenticateWebSocket = (token: string) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("WebSocket token verification error:", error);
    return null;
  }
};

export {
  authenticateToken,
  authenticateWebSocket,
  generateToken,
  JWT_SECRET,
  validateApiKey,
};
