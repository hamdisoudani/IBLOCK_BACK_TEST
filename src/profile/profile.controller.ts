import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from 'src/users/schemas/users.schema';
import { Model } from 'mongoose';
import { SwitchProfileDto } from './dto/switch_profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<Users>,
    private readonly profileService: ProfileService
  ) {}


  @Get()
  async getCurrentUserProfilesInformations(@Req() req : Request) {
    try {
      const user = req.user as accessTokenType;
      const profiles = await this.profileService.getUserProfiles(user);

      return profiles;
      // const profiles = await this.usersService.GetProfiles(user.)
    } catch (error) {
      throw error;
    }
  }

  @Post('/switch')
  @HttpCode(HttpStatus.OK)
  async switchUserProfile(@Req() req : Request, @Body() body: SwitchProfileDto) {
    try {
      const user = req.user as accessTokenType;
      const newAccessToken = await this.profileService.switchProfile(user, body);

      return newAccessToken;
      // const profiles = await this.usersService.GetProfiles(user.)
    } catch (error) {
      throw error;
    }
  }
}
