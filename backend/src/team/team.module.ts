import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TeamController } from "./team.controller.js";
import { TeamService } from "./team.service.js";
import { TeamMember } from "../entities/team-member.entity.js";
import { User } from "../entities/user.entity.js";
import { Business } from "../entities/business.entity.js";
import { ActivityLog } from "../entities/activity-log.entity.js";

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, User, Business, ActivityLog])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
