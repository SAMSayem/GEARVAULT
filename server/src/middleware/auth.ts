import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { db } from "../db.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    role: string;
    photoURL?: string;
  };
}

export async function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const raw = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : "";

    if (!raw) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET missing");

    const payload = jwt.verify(raw, secret, {
      issuer: "gearvault-web",
      audience: "gearvault-api",
    }) as jwt.JwtPayload;

    if (!payload.sub || !ObjectId.isValid(payload.sub)) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    const user = await db()
      .collection("user")
      .findOne({ _id: new ObjectId(payload.sub) });

    if (!user) {
      return res.status(401).json({ message: "Account not found" });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role || "customer",
      photoURL: user.image || user.photoURL,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}

function role(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };
}

export const verifyRenter = role("customer");
export const verifyOwner = role("owner");
export const verifyAdmin = role("admin");
export const verifyOwnerOrAdmin = role("owner", "admin");
