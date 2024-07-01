import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceSchema } from './schema/device.schema';
import { DeviceTypesModule } from '../device_types/device_types.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Device', schema: DeviceSchema }]), DeviceTypesModule],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
