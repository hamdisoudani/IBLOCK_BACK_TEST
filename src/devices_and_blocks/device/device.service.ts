import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './schema/device.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeviceService {
    constructor(@InjectModel(Device.name) private readonly deviceModel: Model<Device>) {}
}
