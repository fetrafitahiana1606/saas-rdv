import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import * as express from "express";
import { User } from "../entities/user.entity.js";

@Controller("auth")
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth() {
    // Guard redirects to Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Req() req: express.Request, @Res() res: express.Response) {
    const user = req.user as User;
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: express.Request) {
    const user = req.user as User;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      plan: user.plan,
    };
  }
}
