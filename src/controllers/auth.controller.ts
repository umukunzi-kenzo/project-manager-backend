import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { registerSchema, loginSchema } from "../schemas/validation.schema";
import { ZodError } from "zod";

const signToken = (id: string, email: string, role: string): string =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role ?? "MEMBER",
      },
    });
    const token = signToken(user.id, user.email, user.role);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ success: false, message: "Invalid input", errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    const passwordMatch = await bcrypt.compare(userData.password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    const token = signToken(user.id, user.email, user.role);
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (error) {
    if (error instanceof ZodError) {  
      res.status(400).json({ success: false, message: "Invalid input", errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};