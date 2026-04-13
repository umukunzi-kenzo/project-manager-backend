import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const signToken = (id: string, email: string, role: string): string =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existing) {
    throw new Error("EMAIL_EXISTS");
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

  return {
    token,
    user,
  };
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.password) {
    throw new Error("GOOGLE_ACCOUNT");
  }

  const passwordMatch = await bcrypt.compare(
    userData.password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = signToken(user.id, user.email, user.role);

  return {
    token,
    user,
  };
};