import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../entities/user.entity.js";
import { Business } from "../../entities/business.entity.js";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Business) private businessRepo: Repository<Business>,
  ) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID") || "",
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET") || "",
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL") || "",
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value;
    const avatar = photos?.[0]?.value;

    let user = await this.userRepo.findOne({ where: { googleId: id } });

    if (!user && email) {
      user = await this.userRepo.findOne({ where: { email } });
      if (user) {
        user.googleId = id;
        if (avatar) user.avatar = avatar;
        user = await this.userRepo.save(user);
      }
    }

    if (!user) {
      user = this.userRepo.create({
        googleId: id,
        email: email || "",
        name: displayName || "",
        avatar: avatar || undefined,
      });
      user = await this.userRepo.save(user);

      const slug = displayName
        ? displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + uuidv4().slice(0, 6)
        : "biz-" + uuidv4().slice(0, 8);

      const business = this.businessRepo.create({
        userId: user.id,
        slug,
      });
      await this.businessRepo.save(business);
    }

    done(null, user);
  }
}
