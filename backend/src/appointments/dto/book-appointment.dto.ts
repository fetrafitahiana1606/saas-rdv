import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class BookAppointmentDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;
}
