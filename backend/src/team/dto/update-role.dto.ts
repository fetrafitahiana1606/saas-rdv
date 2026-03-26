import { IsEnum } from "class-validator";
import { TeamRole } from "../../entities/team-member.entity.js";

export class UpdateRoleDto {
  @IsEnum(TeamRole)
  role: TeamRole;
}
