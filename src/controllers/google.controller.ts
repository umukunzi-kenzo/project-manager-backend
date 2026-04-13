import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id: string, email: string, role: string): string =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "No token provided" });
      return;
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { sub: googleId, email, name, picture: avatar, email_verified } = payload;

    if (!email_verified) {
      res.status(401).json({ success: false, message: "Email not verified with Google" });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { googleId: googleId }
        ]
      }
    });

    if (!existingUser) {
      res.status(404).json({ 
        success: false, 
        message: "No account found with this email. Please register first." 
      });
      return;
    }

    let user = existingUser;
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleId, avatar: avatar }
      });
    }

    const jwtToken = signToken(user.id, user.email, user.role);

    res.status(200).json({
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
    });

  } catch (error) {
    console.error("Google auth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, message: "Google authentication failed: " + errorMessage });
  }
};

export const googleRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: "No token provided" });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const { sub: googleId, email, name, picture: avatar, email_verified } = payload;

    if (!email_verified) {
      res.status(401).json({ success: false, message: "Email not verified with Google" });
      return;
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
      res.status(409).json({ 
        success: false, 
        message: "Account already exists. Please login instead." 
      });
      return;
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

    const jwtToken = signToken(user.id, user.email, user.role);

    res.status(200).json({
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
    });

  } catch (error) {
    console.error("Google register error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({ success: false, message: "Google registration failed: " + errorMessage });
  }
};