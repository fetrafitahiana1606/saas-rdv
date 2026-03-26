import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WidgetController } from "./widget.controller.js";
import { Business } from "../entities/business.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([Business])],
  controllers: [WidgetController],
})
export class WidgetModule {}
