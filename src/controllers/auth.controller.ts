import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.services";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;

    const { token, user } = await registerUser(userData);

    res.status(201).json({
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
    });
  } catch (error: any) {
    if (error.message === "EMAIL_EXISTS") {
      res.status(409).json({
        success: false,
        message: "Email already in use",
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;

    const { token, user } = await loginUser(userData);

    res.status(200).json({
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
    });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    if (error.message === "GOOGLE_ACCOUNT") {
      res.status(401).json({
        success: false,
        message: "Please use Google Sign-In to log in",
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};