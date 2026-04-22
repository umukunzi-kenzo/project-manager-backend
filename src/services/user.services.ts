import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

const safeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export class UserService {
  async getMe(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: safeSelect,
      });

      return { success: true, data: user };
    } catch {
      return { success: false, message: "Server error" };
    }
  }

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({ select: safeSelect });
      return { success: true, data: users };
    } catch {
      return { success: false, message: "Server error" };
    }
  }

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: safeSelect,
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      return { success: true, data: user };
    } catch {
      return { success: false, message: "Server error" };
    }
  }

  async updateMe(userId: string, updateData: any) {
    try {
      if (updateData.email) {
        const existing = await prisma.user.findUnique({
          where: { email: updateData.email },
        });

        if (existing && existing.id !== userId) {
          return { success: false, message: "Email already in use" };
        }
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: safeSelect,
      });

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      };
    } catch {
      return { success: false, message: "Server error" };
    }
  }

  async deleteMe(userId: string) {
    try {
      await prisma.user.delete({ where: { id: userId } });

      return {
        success: true,
        message: "Account deleted successfully",
      };
    } catch {
      return { success: false, message: "Server error" };
    }
  }
}

export const userService = new UserService();