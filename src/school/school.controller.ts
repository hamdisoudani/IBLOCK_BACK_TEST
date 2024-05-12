import { Controller, Post, Body, Req, BadRequestException, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { JoinSchoolDto } from './dto/join_school.dto';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { RoleGuard } from 'src/middleware/role.guard';


@UseGuards(RoleGuard)
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  
  @Roles('student', 'teacher')
  @Post('join')
  async joinSchool(@Body() body: JoinSchoolDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const { message } = await this.schoolService.joinSchool(body, user);

      return {
        message
      };
    } catch (error) {
      throw error;
    }
  }

  
}
