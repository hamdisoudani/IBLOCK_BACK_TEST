import { Module } from '@nestjs/common';
import { DeviceTypesService } from './device_types.service';
import { DeviceTypesController } from './device_types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceTypesSchema } from './schema/device_types.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'DeviceTypes', schema: DeviceTypesSchema }])],
  controllers: [DeviceTypesController],
  providers: [DeviceTypesService],
})
export class DeviceTypesModule {}
