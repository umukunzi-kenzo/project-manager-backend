import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/", (_, res) => res.send("Server is running!"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((_, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});    