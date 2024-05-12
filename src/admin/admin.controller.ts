import { BadRequestException, Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/middleware/role.guard';
import { Public, Roles } from 'src/utils/decorator/middleware.decorator';
import { AddSchoolDto } from '../school/dto/add_school.dto';
import { Request, Response } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { SchoolService } from 'src/school/school.service';


@UseGuards(RoleGuard)
@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly schoolService: SchoolService) {}


  @Post('school')
  async getInfo(@Body() body: AddSchoolDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {message, school} = await this.schoolService.addNewSchool(body, user);

      return {
        message,
        school
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
