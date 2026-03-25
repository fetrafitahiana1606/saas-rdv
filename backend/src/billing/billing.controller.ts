import { Controller, Post, Req, Res, Body, UseGuards, Headers } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { BillingService } from "./billing.service.js";
import * as express from "express";
import { User } from "../entities/user.entity.js";

@Controller("billing")
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  createCheckout(@Req() req: express.Request, @Body("plan") plan: string) {
    const user = req.user as User;
    return this.billingService.createCheckoutSession(user.id, plan);
  }

  @Post("portal")
  @UseGuards(JwtAuthGuard)
  createPortal(@Req() req: express.Request) {
    const user = req.user as User;
    return this.billingService.createPortalSession(user.id);
  }

  @Post("webhook")
  async handleWebhook(
    @Req() req: express.Request,
    @Headers("stripe-signature") signature: string,
    @Res() res: express.Response,
  ) {
    const payload = (req as any).rawBody;
    await this.billingService.handleWebhook(payload, signature);
    res.status(200).json({ received: true });
  }
}
