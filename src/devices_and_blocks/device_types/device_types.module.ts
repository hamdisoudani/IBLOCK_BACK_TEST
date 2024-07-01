import { Module } from '@nestjs/common';
import { DeviceTypesService } from './device_types.service';
import { DeviceTypesController } from './device_types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceTypesSchema } from './schema/device_types.schema';
import { BlocksModule } from '../blocks/blocks.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'DeviceTypes', schema: DeviceTypesSchema }]), BlocksModule],
  controllers: [DeviceTypesController],
  providers: [DeviceTypesService],
  exports: [DeviceTypesService]
})
export class DeviceTypesModule {}
