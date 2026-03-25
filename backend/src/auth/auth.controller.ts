import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import * as express from "express";
import { User, UserPlan } from "../entities/user.entity.js";
import { Business } from "../entities/business.entity.js";
import { Appointment } from "../entities/appointment.entity.js";

@Controller("auth")
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth() {}

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
    return { id: user.id, email: user.email, name: user.name, avatar: user.avatar, plan: user.plan };
  }

  private async findOrCreateDemo(email: string, name: string, plan: UserPlan, bizConfig: any) {
    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      const newUser = this.userRepo.create({ email, name, plan, googleId: "demo-" + email });
      user = await this.userRepo.save(newUser);
    }
    let biz = await this.businessRepo.findOne({ where: { userId: user.id } });
    if (!biz) {
      const newBiz = this.businessRepo.create({ userId: user.id, ...bizConfig } as Partial<Business>);
      biz = await this.businessRepo.save(newBiz as Business);
    }
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { token, user, business: biz };
  }

  @Post("demo-login")
  async demoLogin() {
    return { token: (await this.findOrCreateDemo("demo@saasrdv.test", "Dr. Marie Dupont", UserPlan.FREE, {
      businessName: "Cabinet Dr. Dupont", serviceType: "Consultation m\u00e9dicale", primaryColor: "#8b5cf6", slug: "demo-cabinet", slotDuration: 30,
      hours: { lundi:{start:"09:00",end:"18:00",enabled:true}, mardi:{start:"09:00",end:"18:00",enabled:true}, mercredi:{start:"09:00",end:"18:00",enabled:true}, jeudi:{start:"09:00",end:"18:00",enabled:true}, vendredi:{start:"09:00",end:"18:00",enabled:true}, samedi:{start:"09:00",end:"12:00",enabled:false}, dimanche:{start:"09:00",end:"12:00",enabled:false} },
      formFields: { phone: true, email: true, note: true },
    })).token };
  }

  @Post("demo-login-pro")
  async demoLoginPro() {
    return { token: (await this.findOrCreateDemo("demo-pro@saasrdv.test", "Salon Belle & Zen", UserPlan.PRO, {
      businessName: "Salon Belle & Zen", serviceType: "Coiffure & Bien-\u00eatre", primaryColor: "#ec4899", slug: "demo-salon", slotDuration: 45,
      hours: { lundi:{start:"10:00",end:"19:00",enabled:true}, mardi:{start:"10:00",end:"19:00",enabled:true}, mercredi:{start:"10:00",end:"19:00",enabled:true}, jeudi:{start:"10:00",end:"19:00",enabled:true}, vendredi:{start:"10:00",end:"19:00",enabled:true}, samedi:{start:"10:00",end:"19:00",enabled:true}, dimanche:{start:"10:00",end:"19:00",enabled:false} },
      formFields: { phone: true, email: true, note: true },
    })).token };
  }

  @Post("demo-login-business")
  async demoLoginBusiness() {
    return { token: (await this.findOrCreateDemo("demo-biz@saasrdv.test", "Agence ImmoPlus", UserPlan.BUSINESS, {
      businessName: "Agence ImmoPlus", serviceType: "Visite immobili\u00e8re", primaryColor: "#f97316", slug: "demo-immo", slotDuration: 60,
      hours: { lundi:{start:"09:00",end:"19:00",enabled:true}, mardi:{start:"09:00",end:"19:00",enabled:true}, mercredi:{start:"09:00",end:"19:00",enabled:true}, jeudi:{start:"09:00",end:"19:00",enabled:true}, vendredi:{start:"09:00",end:"19:00",enabled:true}, samedi:{start:"10:00",end:"16:00",enabled:true}, dimanche:{start:"10:00",end:"16:00",enabled:false} },
      formFields: { phone: true, email: true, note: true },
    })).token };
  }

  @Get("demo-seed")
  async demoSeed() {
    const businesses = await this.businessRepo.find();
    let count = 0;
    const now = new Date();
    const names = ["Jean Martin","Sophie Bernard","Lucas Moreau","Emma Petit","Hugo Robert","Lea Richard","Tom Durand","Chloe Simon"];
    const emails = ["jean@test.com","sophie@test.com","lucas@test.com","emma@test.com","hugo@test.com","lea@test.com","tom@test.com","chloe@test.com"];
    const phones = ["+33 6 12 34 56 78","+33 6 23 45 67 89","+33 6 34 56 78 90","+33 6 45 67 89 01"];
    const notes = ["Premiere visite","Suivi mensuel","Urgence","Demande de devis","Recommande par un ami","Rappel necessaire"];
    const times = ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
    for (const biz of businesses) {
      const existing = await this.appointmentRepo.count({ where: { businessId: biz.id } });
      if (existing > 0) continue;
      for (let i = 0; i < 7; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + i + 1);
        if (futureDate.getDay() === 0) continue;
        const dateStr = futureDate.toISOString().split("T")[0];
        const startTime = times[Math.floor(Math.random() * times.length)];
        const duration = biz.slotDuration || 30;
        const [h, m] = startTime.split(":").map(Number);
        const endMin = h * 60 + m + duration;
        const endTime = String(Math.floor(endMin / 60)).padStart(2, "0") + ":" + String(endMin % 60).padStart(2, "0");
        const appt = this.appointmentRepo.create({ businessId: biz.id, clientName: names[i % names.length], clientEmail: emails[i % emails.length], clientPhone: phones[i % phones.length], note: notes[i % notes.length], date: dateStr, startTime, endTime });
        await this.appointmentRepo.save(appt);
        count++;
      }
    }
    return { message: "Seed complete", count };
  }
}
