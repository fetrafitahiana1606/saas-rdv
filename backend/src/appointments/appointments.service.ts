import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Appointment } from "../entities/appointment.entity.js";
import { Business } from "../entities/business.entity.js";
import { BookAppointmentDto } from "./dto/book-appointment.dto.js";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Business) private businessRepo: Repository<Business>,
  ) {}

  async getAppointments(userId: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
    const business = await this.businessRepo.findOne({ where: { userId } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const where: Record<string, unknown> = { businessId: business.id };
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    return this.appointmentRepo.find({
      where,
      order: { date: "ASC", startTime: "ASC" },
    });
  }

  async bookAppointment(slug: string, dto: BookAppointmentDto): Promise<Appointment> {
    const business = await this.businessRepo.findOne({ where: { slug } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const endTime = this.addMinutes(dto.startTime, business.slotDuration);

    // Verify slot is available
    const dayName = this.getDayName(dto.date);
    const dayConfig = business.hours[dayName];
    if (!dayConfig || !dayConfig.enabled) {
      throw new BadRequestException("This day is not available");
    }

    if (dto.startTime < dayConfig.start || endTime > dayConfig.end) {
      throw new BadRequestException("Time slot is outside business hours");
    }

    // Check for overlapping appointments
    const existing = await this.appointmentRepo.find({
      where: { businessId: business.id, date: dto.date },
    });

    const hasConflict = existing.some(
      (appt) => dto.startTime < appt.endTime && endTime > appt.startTime,
    );

    if (hasConflict) {
      throw new BadRequestException("This time slot is already booked");
    }

    const appointment = this.appointmentRepo.create({
      businessId: business.id,
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      clientPhone: dto.clientPhone,
      note: dto.note,
      date: dto.date,
      startTime: dto.startTime,
      endTime,
    });

    return this.appointmentRepo.save(appointment);
  }

  async deleteAppointment(id: string, userId: string): Promise<void> {
    const business = await this.businessRepo.findOne({ where: { userId } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const appointment = await this.appointmentRepo.findOne({
      where: { id, businessId: business.id },
    });
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    await this.appointmentRepo.remove(appointment);
  }

  async getAvailability(slug: string, date: string): Promise<{ startTime: string; endTime: string }[]> {
    const business = await this.businessRepo.findOne({ where: { slug } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const dayName = this.getDayName(date);
    const dayConfig = business.hours[dayName];
    if (!dayConfig || !dayConfig.enabled) {
      return [];
    }

    // Generate all possible slots
    const allSlots: { startTime: string; endTime: string }[] = [];
    let current = dayConfig.start;
    while (true) {
      const end = this.addMinutes(current, business.slotDuration);
      if (end > dayConfig.end) break;
      allSlots.push({ startTime: current, endTime: end });
      current = end;
    }

    // Get existing appointments
    const existing = await this.appointmentRepo.find({
      where: { businessId: business.id, date },
    });

    // Filter out booked slots
    return allSlots.filter((slot) => {
      return !existing.some(
        (appt) => slot.startTime < appt.endTime && slot.endTime > appt.startTime,
      );
    });
  }

  private addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(":").map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }

  private getDayName(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
  }
}
