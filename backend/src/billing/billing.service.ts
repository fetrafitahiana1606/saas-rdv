import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Stripe from "stripe";
import { User, UserPlan } from "../entities/user.entity.js";

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    const stripeKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    this.stripe = new Stripe(stripeKey || "");
  }

  async createCheckoutSession(userId: string, plan: string): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const priceId = this.getPriceId(plan);
    if (!priceId) {
      throw new BadRequestException("Invalid plan");
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await this.userRepo.save(user);
    }

    const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/billing?success=true`,
      cancel_url: `${frontendUrl}/billing?canceled=true`,
      metadata: { userId: user.id, plan },
    });

    return { url: session.url || "" };
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.stripeCustomerId) {
      throw new BadRequestException("No billing account found");
    }

    const frontendUrl = this.configService.get<string>("FRONTEND_URL") || "http://localhost:3000";

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret || "");
    } catch {
      throw new BadRequestException("Invalid webhook signature");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        if (userId && plan) {
          await this.userRepo.update(userId, {
            plan: plan as UserPlan,
            stripeSubscriptionId: session.subscription as string,
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await this.userRepo.findOne({ where: { stripeCustomerId: customerId } });
        if (user) {
          user.stripeSubscriptionId = subscription.id;
          await this.userRepo.save(user);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await this.userRepo.findOne({ where: { stripeCustomerId: customerId } });
        if (user) {
          user.plan = UserPlan.FREE;
          user.stripeSubscriptionId = undefined as unknown as string;
          await this.userRepo.save(user);
        }
        break;
      }
    }
  }

  private getPriceId(plan: string): string | null {
    const prices: Record<string, string | undefined> = {
      pro: this.configService.get<string>("STRIPE_PRICE_PRO"),
      business: this.configService.get<string>("STRIPE_PRICE_BUSINESS"),
      team: this.configService.get<string>("STRIPE_PRICE_TEAM"),
    };
    return prices[plan] || null;
  }
}
