import { Controller, Get, Param, Header, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Business } from "../entities/business.entity.js";

@Controller("widget")
export class WidgetController {
  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
  ) {}

  @Get(":slug")
  @Header("Access-Control-Allow-Origin", "*")
  async getWidgetConfig(@Param("slug") slug: string) {
    const business = await this.businessRepo.findOne({ where: { slug } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }

    return {
      business: {
        businessName: business.businessName,
        serviceType: business.serviceType,
        primaryColor: business.primaryColor,
        slug: business.slug,
        hours: business.hours,
        slotDuration: business.slotDuration,
        formFields: business.formFields,
      },
      embedUrl: `/book/${business.slug}`,
    };
  }
}
