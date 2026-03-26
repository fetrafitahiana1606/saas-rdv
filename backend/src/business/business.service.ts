import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Business } from "../entities/business.entity.js";
import { ActivityLog } from "../entities/activity-log.entity.js";
import { UpdateBusinessDto } from "./dto/update-business.dto.js";

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(ActivityLog) private activityLogRepo: Repository<ActivityLog>,
  ) {}

  async getByUserId(userId: string): Promise<Business> {
    const business = await this.businessRepo.findOne({ where: { userId } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }
    return business;
  }

  async getBySlug(slug: string): Promise<Business> {
    const business = await this.businessRepo.findOne({ where: { slug } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }
    return business;
  }

  async update(userId: string, dto: UpdateBusinessDto): Promise<Business> {
    const business = await this.getByUserId(userId);

    if (dto.slug && dto.slug !== business.slug) {
      const existing = await this.businessRepo.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException("This slug is already taken");
      }
    }

    const changedFields = Object.keys(dto);
    Object.assign(business, dto);
    const saved = await this.businessRepo.save(business);

    // Log activity
    const log = this.activityLogRepo.create({
      businessId: business.id,
      userId,
      action: "CONFIG_UPDATED",
      targetType: "business",
      targetId: business.id,
      metadata: { changedFields },
    });
    await this.activityLogRepo.save(log);

    return saved;
  }
}
