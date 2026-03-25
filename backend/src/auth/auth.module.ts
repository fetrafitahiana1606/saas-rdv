import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller.js";
import { GoogleStrategy } from "./strategies/google.strategy.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { User } from "../entities/user.entity.js";
import { Business } from "../entities/business.entity.js";
import { Appointment } from "../entities/appointment.entity.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Business, Appointment]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") || "default_jwt_secret",
        signOptions: { expiresIn: "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
