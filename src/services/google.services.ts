import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

export class GoogleAuthService {
  private googleClient: OAuth2Client;
  private readonly JWT_SECRET: string;

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.JWT_SECRET = process.env.JWT_SECRET!;
  }

  private signToken(id: string, email: string, role: string): string {
    return jwt.sign({ id, email, role }, this.JWT_SECRET, { expiresIn: "7d" });
  }

  async googleAuth(reqBody: any) {
    try {
      const { token } = reqBody;

      if (!token) {
        return { success: false, message: "No token provided" };
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return { success: false, message: "Invalid Google token" };
      }

      const { sub: googleId, email, name, picture: avatar, email_verified } = payload;

      if (!email_verified) {
        return { success: false, message: "Email not verified with Google" };
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { googleId: googleId }
          ]
        }
      });

      if (!existingUser) {
        return { 
          success: false, 
          message: "No account found with this email. Please register first." 
        };
      }

      let user = existingUser;
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleId, avatar: avatar }
        });
      }

      const jwtToken = this.signToken(user.id, user.email, user.role);

      return {
        success: true,
        message: "Google login successful",
        token: jwtToken,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      console.error("Google auth error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, message: "Google authentication failed: " + errorMessage };
    }
  }

  async googleRegister(reqBody: any) {
    try {
      const { token } = reqBody;

      if (!token) {
        return { success: false, message: "No token provided" };
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return { success: false, message: "Invalid Google token" };
      }

      const { sub: googleId, email, name, picture: avatar, email_verified } = payload;

      if (!email_verified) {
        return { success: false, message: "Email not verified with Google" };
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { googleId: googleId }
          ]
        }
      });

      if (existingUser) {
        return { 
          success: false, 
          message: "Account already exists. Please login instead." 
        };
      }

      const randomPassword = Math.random().toString(36) + Math.random().toString(36);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const user = await prisma.user.create({
        data: {
          name: name || email?.split('@')[0] || "User",
          email: email!,
          password: hashedPassword,
          googleId: googleId,
          avatar: avatar || null,
          role: "MEMBER"
        }
      });

      const jwtToken = this.signToken(user.id, user.email, user.role);

      return {
        success: true,
        message: "Google registration successful",
        token: jwtToken,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      console.error("Google register error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return { success: false, message: "Google registration failed: " + errorMessage };
    }
  }
}

export const googleAuthService = new GoogleAuthService();