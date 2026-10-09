import { Request, Response } from "express";
import { googleAuthService } from "../services/google.services";

export class GoogleController {
  async googleAuth(req: Request, res: Response): Promise<void> {
    const response = await googleAuthService.googleAuth(req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async googleRegister(req: Request, res: Response): Promise<void> {
    const response = await googleAuthService.googleRegister(req.body);
    const status = response.success ? 200 : 400;
    res.status(status).json(response);
  }

  async googleRedirectCallback(req: Request, res: Response): Promise<void> {
    const { credential, g_csrf_token } = req.body;
    const cookieToken = (req as any).cookies?.g_csrf_token;

    if (!g_csrf_token || !cookieToken || g_csrf_token !== cookieToken) {
      res.status(400).send("CSRF verification failed");
      return;
    }

    const mode = (req.query.mode as string) || "login";
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const response =
      mode === "register"
        ? await googleAuthService.googleRegister({ token: credential })
        : await googleAuthService.googleAuth({ token: credential });

    if (!response.success) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          response.message || "Google auth failed"
        )}`
      );
      return;
    }

    const token = response.token;
    const user = encodeURIComponent(JSON.stringify(response.data));
    res.redirect(`${clientUrl}/auth-callback?token=${token}&user=${user}`);
    return;
  }
}

export const googleController = new GoogleController();