import { Controller } from '@nestjs/common';
import { DeviceTypesService } from './device_types.service';

@Controller('device-types')
export class DeviceTypesController {
  constructor(private readonly deviceTypesService: DeviceTypesService) {}
}
