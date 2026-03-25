import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Business } from "../entities/business.entity.js";
import { UpdateBusinessDto } from "./dto/update-business.dto.js";

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
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

    Object.assign(business, dto);
    return this.businessRepo.save(business);
  }
}
