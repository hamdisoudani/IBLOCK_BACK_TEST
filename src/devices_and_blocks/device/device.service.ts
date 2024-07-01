import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './schema/device.schema';
import { Model, Types } from 'mongoose';
import { CreateDeviceDto } from './dto/create_device.dto';
import { DeviceTypesService } from '../device_types/device_types.service';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';
import { accessTokenType } from 'src/utils/types/access_token.type';

@Injectable()
export class DeviceService {
    constructor(
        @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
        private readonly deviceTypeService: DeviceTypesService,
    ) {}

    private generateUniqueID(): string {
        const nanoid = customAlphabet(CUSTOM_INVITATION_CODE_ALPHABET, 6);
        return nanoid();
    }
    async getDevices(): Promise<DeviceDocument[]> {
        try {
            const devices = await this.deviceModel.find();
            return devices;
        } catch (error) {
            throw new Error("An error occured while fetching devices");
        }
    }

    async createNewDevice(body: CreateDeviceDto, user: accessTokenType): Promise<{message: string, createdDevice: DeviceDocument}> {
        try {
            // Check if device type exists
            const deviceTypeExist = await this.deviceTypeService.checkIfDeviceTypeExists(body.deviceType);
            if(!deviceTypeExist) throw new BadRequestException("Device type does not exist");

            // Check if device already exists
            const deviceExist = await this.deviceModel.exists({name: body.name});
            if(deviceExist) throw new BadRequestException("Device already exist");

            // Create new device
            const newDevice = new this.deviceModel({
                name: body.name,
                deviceType: new Types.ObjectId(body.deviceType),
                uniqueId: this.generateUniqueID(),
                createdBy: new Types.ObjectId(user.userId)
            });
            await newDevice.save();
            return {
                message: "Device created successfully",
                createdDevice: newDevice
            
            };

        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException("An error occured while creating new device", error);
        }
    }
}
