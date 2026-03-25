import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { AppointmentsService } from "./appointments.service.js";
import { BookAppointmentDto } from "./dto/book-appointment.dto.js";
import * as express from "express";
import { User } from "../entities/user.entity.js";

@Controller("appointments")
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAppointments(
    @Req() req: express.Request,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const user = req.user as User;
    return this.appointmentsService.getAppointments(user.id, startDate, endDate);
  }

  @Post("book/:slug")
  bookAppointment(@Param("slug") slug: string, @Body() dto: BookAppointmentDto) {
    return this.appointmentsService.bookAppointment(slug, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  deleteAppointment(@Param("id") id: string, @Req() req: express.Request) {
    const user = req.user as User;
    return this.appointmentsService.deleteAppointment(id, user.id);
  }

  @Get("availability/:slug")
  async getAvailability(@Param("slug") slug: string, @Query("date") date: string) {
    const availability = await this.appointmentsService.getAvailability(slug, date);
    return { slots: availability.map((s) => s.startTime) };
  }
}
