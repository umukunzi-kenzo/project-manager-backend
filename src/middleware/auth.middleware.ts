import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../schemas/validation.schema";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export class AuthMiddleware {
  private readonly JWT_SECRET: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET!;
  }

  authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  }

  authorize(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      next();
    };
  }
}

export const authMiddleware = new AuthMiddleware();
export const authenticate = authMiddleware.authenticate.bind(authMiddleware);
export const authorize = authMiddleware.authorize.bind(authMiddleware);