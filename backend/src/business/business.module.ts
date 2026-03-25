import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessController } from "./business.controller.js";
import { BusinessService } from "./business.service.js";
import { Business } from "../entities/business.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([Business])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
