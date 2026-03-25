import { Controller, Get, Put, Body, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { BusinessService } from "./business.service.js";
import { UpdateBusinessDto } from "./dto/update-business.dto.js";
import * as express from "express";
import { User } from "../entities/user.entity.js";

@Controller("business")
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMyBusiness(@Req() req: express.Request) {
    const user = req.user as User;
    return this.businessService.getByUserId(user.id);
  }

  @Put("me")
  @UseGuards(JwtAuthGuard)
  updateMyBusiness(@Req() req: express.Request, @Body() dto: UpdateBusinessDto) {
    const user = req.user as User;
    return this.businessService.update(user.id, dto);
  }

  @Get("public/:slug")
  getPublicBusiness(@Param("slug") slug: string) {
    return this.businessService.getBySlug(slug);
  }
}
