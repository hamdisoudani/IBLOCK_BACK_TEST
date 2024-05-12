import { Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ClassService } from './class.service';
import { RoleGuard } from 'src/middleware/role.guard';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { CreateClassDto } from './dto/create_class.dto';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { JoinClassDto } from './dto/join_class.dto';

@UseGuards(RoleGuard)
@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Roles('teacher')
  @Post('add')
  async addClass(@Body() body: CreateClassDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const newClass = await this.classService.createClass(body, user);
      return {
        message: "The class was created successfully",
        classDetails: newClass
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinClass(@Body() body: JoinClassDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const { message } = await this.classService.joinClass(body, user);
      return {
        message
      }
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async getClassInformation(@Param('id') id: string, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const classDetails = await this.classService.getClassInformation(id, user);

      return {
        classDetails
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  @Roles('teacher', 'student')
  @Get()
  async getEnrolledClasses(@Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const enrolledClasses = await this.classService.getEnrolledClasses(user);

      return {
        enrolledClasses
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

}
