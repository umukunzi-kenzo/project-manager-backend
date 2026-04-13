import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { googleAuth, googleRegister } from "../controllers/google.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../schemas/validation.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.post("/google", googleAuth);
router.post("/google-register", googleRegister);

export default router;