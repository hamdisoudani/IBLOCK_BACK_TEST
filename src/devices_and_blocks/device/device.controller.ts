import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { RoleGuard } from 'src/middleware/role.guard';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from 'src/users/schemas/users.schema';
import { CreateDeviceDto } from './dto/create_device.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { Request } from 'express';

@Controller('devices')
@UseGuards(RoleGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}


  @Roles(Role.ROBOTADMIN)
  @Post('/create')
  async createDevice(@Body() body: CreateDeviceDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const createdDevice = await this.deviceService.createNewDevice(body, user);
      return createdDevice;
    } catch (error) {
      throw error;
    }
  }
}
