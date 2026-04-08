import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { updateUserSchema } from "../schemas/validation.schema";
import { ZodError } from "zod";

const safeSelect = { id: true, name: true, email: true, role: true, createdAt: true };

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: safeSelect });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ select: safeSelect });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string }, select: safeSelect });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = updateUserSchema.parse(req.body);
    if (updateData.email) {
      const existing = await prisma.user.findUnique({ where: { email: updateData.email } });
      if (existing && existing.id !== req.user!.id) {
        res.status(409).json({ success: false, message: "Email already in use" });
        return;
      }
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: safeSelect,
    });
    res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ success: false, message: "Invalid input", errors: error.issues });
      return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMe = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};