import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SchoolAdminService } from './school_admin.service';
import { RoleGuard } from 'src/middleware/role.guard';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from 'src/users/schemas/users.schema';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { GetInformationAboutUserDto } from 'src/school/dto/get_information_about_user.dto';

@Controller('school-admin')
@UseGuards(RoleGuard)
@Roles(Role.SCHOOL_ADMIN)
export class SchoolAdminController {
  constructor(private readonly schoolAdminService: SchoolAdminService) {}


  @Get('/users')
  async getAllJoinedUsers(@Req() req: Request) {
    try {
      const user = req.user as accessTokenType;
      const users = await this.schoolAdminService.getAllJoinedUsers(user);
      return {
        message: "All joined users fetched successfully",
        users
      }
    } catch (error) {
      throw error;
    }
  }

  @Get('/stats')
  async getSchoolStats(@Req() req: Request) {
    try {
      const user = req.user as accessTokenType;
      const stats = await this.schoolAdminService.getSchoolStats(user);
      return {
        message: "School stats fetched successfully",
        stats
      }
    } catch (error) {
      throw error;
    }
  }

  @Get('/user/:userID')
  async getInformationAboutUser(@Param() params: GetInformationAboutUserDto,@Req() req: Request) {
    try {
      const user = req.user as accessTokenType;
      const userInformation = await this.schoolAdminService.getUserStats(user, params);
      return {
        message: "User information fetched successfully",
        userInformation
      }
    } catch (error) {
      throw error;
    }
  }
}
