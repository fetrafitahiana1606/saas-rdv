import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module.js";
import { BusinessModule } from "./business/business.module.js";
import { AppointmentsModule } from "./appointments/appointments.module.js";
import { BillingModule } from "./billing/billing.module.js";
import { WidgetModule } from "./widget/widget.module.js";
import { TeamModule } from "./team/team.module.js";
import { User } from "./entities/user.entity.js";
import { Business } from "./entities/business.entity.js";
import { Appointment } from "./entities/appointment.entity.js";
import { ActivityLog } from "./entities/activity-log.entity.js";
import { TeamMember } from "./entities/team-member.entity.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT || "5432"),
      username: process.env.DATABASE_USER || "saasrdv",
      password: process.env.DATABASE_PASSWORD || "saasrdv_dev",
      database: process.env.DATABASE_NAME || "saasrdv",
      entities: [User, Business, Appointment, ActivityLog, TeamMember],
      synchronize: true,
    }),
    AuthModule,
    BusinessModule,
    AppointmentsModule,
    BillingModule,
    WidgetModule,
    TeamModule,
  ],
})
export class AppModule {}
