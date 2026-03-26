import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { TeamService } from "./team.service.js";
import { InviteTeamMemberDto } from "./dto/invite-team-member.dto.js";
import { UpdateRoleDto } from "./dto/update-role.dto.js";
import * as express from "express";
import { User } from "../entities/user.entity.js";

@Controller("team")
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getTeamMembers(@Req() req: express.Request) {
    const user = req.user as User;
    return this.teamService.getTeamMembers(user.id);
  }

  @Post("invite")
  @UseGuards(JwtAuthGuard)
  inviteMember(@Req() req: express.Request, @Body() dto: InviteTeamMemberDto) {
    const user = req.user as User;
    return this.teamService.inviteMember(user.id, dto);
  }

  @Put(":memberId/role")
  @UseGuards(JwtAuthGuard)
  updateMemberRole(
    @Req() req: express.Request,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const user = req.user as User;
    return this.teamService.updateMemberRole(user.id, memberId, dto.role);
  }

  @Delete(":memberId")
  @UseGuards(JwtAuthGuard)
  removeMember(@Req() req: express.Request, @Param("memberId") memberId: string) {
    const user = req.user as User;
    return this.teamService.removeMember(user.id, memberId);
  }

  @Get("activity")
  @UseGuards(JwtAuthGuard)
  getActivityLog(@Req() req: express.Request, @Query("limit") limit?: string) {
    const user = req.user as User;
    return this.teamService.getActivityLog(user.id, limit ? parseInt(limit, 10) : 50);
  }
}
