import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceTypes } from './schema/device_types.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeviceTypesService {
    constructor(
        @InjectModel(DeviceTypes.name) private readonly deviceTypesModel: Model<DeviceTypes>,
    ) {}
}
