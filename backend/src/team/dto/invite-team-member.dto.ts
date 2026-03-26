import { IsEmail, IsString, IsNotEmpty, IsEnum } from "class-validator";
import { TeamRole } from "../../entities/team-member.entity.js";

export class InviteTeamMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TeamRole)
  role: TeamRole;
}
