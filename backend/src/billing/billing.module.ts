import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BillingController } from "./billing.controller.js";
import { BillingService } from "./billing.service.js";
import { User } from "../entities/user.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
