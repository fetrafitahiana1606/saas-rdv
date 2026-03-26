import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentsController } from "./appointments.controller.js";
import { AppointmentsService } from "./appointments.service.js";
import { Appointment } from "../entities/appointment.entity.js";
import { Business } from "../entities/business.entity.js";
import { ActivityLog } from "../entities/activity-log.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Business, ActivityLog])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
