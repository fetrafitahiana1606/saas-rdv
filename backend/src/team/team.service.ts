import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TeamMember } from "../entities/team-member.entity.js";
import { User } from "../entities/user.entity.js";
import { Business } from "../entities/business.entity.js";
import { ActivityLog } from "../entities/activity-log.entity.js";
import { InviteTeamMemberDto } from "./dto/invite-team-member.dto.js";
import { TeamRole } from "../entities/team-member.entity.js";

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember) private teamMemberRepo: Repository<TeamMember>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(ActivityLog) private activityLogRepo: Repository<ActivityLog>,
  ) {}

  private async getBusinessByOwner(userId: string): Promise<Business> {
    const business = await this.businessRepo.findOne({ where: { userId } });
    if (!business) {
      throw new NotFoundException("Business not found");
    }
    return business;
  }

  async getTeamMembers(userId: string): Promise<TeamMember[]> {
    const business = await this.getBusinessByOwner(userId);
    return this.teamMemberRepo.find({
      where: { businessId: business.id },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  async inviteMember(userId: string, dto: InviteTeamMemberDto): Promise<TeamMember> {
    const business = await this.getBusinessByOwner(userId);

    let user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      user = this.userRepo.create({ email: dto.email, name: dto.name });
      user = await this.userRepo.save(user);
    }

    const existing = await this.teamMemberRepo.findOne({
      where: { businessId: business.id, userId: user.id },
    });
    if (existing) {
      throw new ForbiddenException("This user is already a team member");
    }

    const member = this.teamMemberRepo.create({
      businessId: business.id,
      userId: user.id,
      role: dto.role,
      invitedBy: userId,
    });
    const saved = await this.teamMemberRepo.save(member);

    await this.logActivity(business.id, userId, "MEMBER_INVITED", "member", saved.id, {
      email: dto.email,
      role: dto.role,
    });

    return saved;
  }

  async updateMemberRole(userId: string, memberId: string, role: TeamRole): Promise<TeamMember> {
    const business = await this.getBusinessByOwner(userId);

    const member = await this.teamMemberRepo.findOne({
      where: { id: memberId, businessId: business.id },
    });
    if (!member) {
      throw new NotFoundException("Team member not found");
    }

    member.role = role;
    const saved = await this.teamMemberRepo.save(member);

    await this.logActivity(business.id, userId, "CONFIG_UPDATED", "member", memberId, {
      newRole: role,
    });

    return saved;
  }

  async removeMember(userId: string, memberId: string): Promise<void> {
    const business = await this.getBusinessByOwner(userId);

    const member = await this.teamMemberRepo.findOne({
      where: { id: memberId, businessId: business.id },
      relations: ["user"],
    });
    if (!member) {
      throw new NotFoundException("Team member not found");
    }

    const memberEmail = member.user?.email;
    await this.teamMemberRepo.remove(member);

    await this.logActivity(business.id, userId, "MEMBER_REMOVED", "member", memberId, {
      email: memberEmail,
    });
  }

  async getActivityLog(userId: string, limit: number = 50): Promise<ActivityLog[]> {
    const business = await this.getBusinessByOwner(userId);
    return this.activityLogRepo.find({
      where: { businessId: business.id },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  private async logActivity(
    businessId: string,
    userId: string,
    action: string,
    targetType: string,
    targetId: string | null,
    metadata: Record<string, any> | null = null,
  ): Promise<void> {
    const log = this.activityLogRepo.create({
      businessId,
      userId,
      action,
      targetType,
      targetId,
      metadata,
    });
    await this.activityLogRepo.save(log);
  }
}
