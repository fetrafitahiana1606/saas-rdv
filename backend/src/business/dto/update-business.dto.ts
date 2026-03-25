import { IsString, IsOptional, IsNumber, IsObject, Min, Max } from "class-validator";

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsObject()
  hours?: Record<string, { start: string; end: string; enabled: boolean }>;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(240)
  slotDuration?: number;

  @IsOptional()
  @IsObject()
  formFields?: { phone: boolean; email: boolean; note: boolean };
}
