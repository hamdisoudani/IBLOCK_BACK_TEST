import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { RequestCreateClassService } from './request-create-class.service';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from 'src/users/schemas/users.schema';
import { CreateClassRequestDto } from './dto/create_class_request.dto';

@Controller('rcc') // request-create-class
export class RequestCreateClassController {
  constructor(private readonly requestCreateClassService: RequestCreateClassService) {}


  @Get()
  @Roles(Role.STUDENT, Role.TEACHER)
  async getRequests(@Req() req: Request){
    try {
      const user = req.user as accessTokenType;
      const requests = await this.requestCreateClassService.getRequests(user);
      return {
        requests
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('create')
  @Roles(Role.TEACHER)
  async createRequest(@Req() req: Request, @Body() body : CreateClassRequestDto){
    try {
      const user = req.user as accessTokenType;
      const body = req.body;
      const response = await this.requestCreateClassService.createRequest(body, user);
      return {
        message: response.message
      }
    } catch (error) {
      throw error;
    }
  }
}
