import { AdminService } from './admin.service';
import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/middleware/role.guard';
import { Public, Roles } from 'src/utils/decorator/middleware.decorator';
import { AddSchoolDto } from '../school/dto/add_school.dto';
import { Request, Response } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { SchoolService } from 'src/school/school.service';
import { Role } from 'src/users/schemas/users.schema';
import { DeleteUserDto } from './dto/delete_user.dto';
import { ChangeSchoolAdminDto } from 'src/school/dto/change_admin.dto';


@UseGuards(RoleGuard)
@Controller('super-admin')
@Roles(Role.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly AdminService: AdminService
  ) {}


  @Post('school/add')
  async getInfo(@Body() body: AddSchoolDto) {
    try {
      const {message, school, adminSchool} = await this.AdminService.addSchool(body);

      return {
        message,
        school,
        adminSchool
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/global_stats')
  async getGeneralInformations() {
    try {
      const generalInformations = await this.AdminService.getGeneralInformations();
      return generalInformations;
    } catch (error) {
      throw error;
    }
  }

  @Get('/users')
  async getAllUsers() {
    try {
      const users = await this.AdminService.getAllUsers();
      return users;
    } catch (error) {
      throw error;
    }
  }

  @Post('/user/:userID/delete')
  async deleteUser(@Param() params: DeleteUserDto) {
    try {
      const {message} = await this.AdminService.deleteUser(params.userID);
      return {
        message
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/school/change_admin')
  async changeSchoolAdmin(@Body() body: ChangeSchoolAdminDto) {
    try {
      const { message , newAdmin} = await this.AdminService.ChangeSchoolAdmin(body);
      return {
        message,
        newAdmin
      }
    } catch (error) {
      throw error;
    }
  }
}
