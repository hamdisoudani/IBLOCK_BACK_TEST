import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DeviceTypesService } from './device_types.service';
import { RoleGuard } from 'src/middleware/role.guard';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from 'src/users/schemas/users.schema';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { CreateNewDeviceTypeDto } from './dto/create_new_device_type.dto';

@Controller('device-types')
@UseGuards(RoleGuard)
@Roles(Role.ROBOTADMIN)
export class DeviceTypesController {
  constructor(private readonly deviceTypesService: DeviceTypesService) {}


  @Post("/add")
  async addDeviceType(@Body() body: CreateNewDeviceTypeDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const deviceType = await this.deviceTypesService.createNewDeviceType(body, user);
      return {
        "message": "Device type created successfully",
        deviceType
      }
    } catch (error) {
      throw error;
    }
  }
}
