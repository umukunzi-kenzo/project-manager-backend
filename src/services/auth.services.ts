import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export class AuthService {
  private signToken(id: string, email: string, role: string): string {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }

  async registerUser(userData: any) {
    try {
      const existingEmail = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingEmail) {
        return {
          success: false,
          message: "Email already in use",
        };
      }

      const existingName = await prisma.user.findFirst({
        where: { name: userData.name },
      });

      if (existingName) {
        return {
          success: false,
          message: "Username already taken. Please choose another.",
        };
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

      const token = this.signToken(user.id, user.email, user.role);

      return {
        success: true,
        message: "User registered successfully",
        token,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        return {
          success: false,
          message: "Username or email already taken",
        };
      }
      
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Server error. Please try again later.",
      };
    }
  }

  async loginUser(userData: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      if (!user.password) {
        return {
          success: false,
          message: "Please use Google Sign-In to log in",
        };
      }

      const passwordMatch = await bcrypt.compare(
        userData.password,
        user.password
      );

      if (!passwordMatch) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      const token = this.signToken(user.id, user.email, user.role);

      return {
        success: true,
        message: "Login successful",
        token,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Server error. Please try again later.",
      };
    }
  }
}

export const authService = new AuthService(); 