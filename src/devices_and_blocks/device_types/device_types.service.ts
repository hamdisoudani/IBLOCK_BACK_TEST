import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceTypes, DeviceTypesDocument } from './schema/device_types.schema';
import { Model, Types } from 'mongoose';
import { CreateNewDeviceTypeDto } from './dto/create_new_device_type.dto';
import { BlocksCategory } from '../blocks/schemas/blocks_category.schema';
import { BlocksService } from '../blocks/blocks.service';
import { accessTokenType } from 'src/utils/types/access_token.type';

@Injectable()
export class DeviceTypesService {
    constructor(
        @InjectModel(DeviceTypes.name) private readonly deviceTypesModel: Model<DeviceTypes>,
        private readonly blocksCategoryService: BlocksService
    ) {}

    private async validateImageUrl(url: string): Promise<boolean> {
     
        const res = await fetch(url);
        const buff = await res.blob();
       
        return buff.type.startsWith('image/')
   
   }

    async checkIfDeviceTypeExists(device_type: string): Promise<boolean> {
        try {
            // Check if the device type exists
            const deviceType = await this.deviceTypesModel.exists({ _id: new Types.ObjectId(device_type) });
            if(deviceType) return true
            return false
        } catch (error) {
            throw new InternalServerErrorException("error occured while checking if device type exists");
        }
    }

    async createNewDeviceType(Body: CreateNewDeviceTypeDto, user: accessTokenType): Promise<DeviceTypesDocument> {
        try {
            
            // Check if the device type already exists
            const deviceTypeExists = await this.deviceTypesModel.findOne({ deviceType: Body.deviceType });
            if (deviceTypeExists) throw new BadRequestException('Device type already exists');

            // Check if the image URL is valid
            const isValidImageUrl = await this.validateImageUrl(Body.imgUrl);
            if (!isValidImageUrl) throw new BadRequestException('Invalid image URL');

            // Check once again on the connection protocols to ensure they are valid
            const validConnectionProtocols = ['serial_port', 'bluetooth', 'wifi'];
            const invalidConnectionProtocols = Body.connectionProtocol.filter(protocol => !validConnectionProtocols.includes(protocol));
            if (invalidConnectionProtocols.length > 0) throw new BadRequestException(`Invalid connection protocols: ${invalidConnectionProtocols.join(', ')}`);

            // Check if the categories are valid
            const categories = await this.blocksCategoryService.getAllAvailableCategoriesFromArray(Body.categories);
            if (categories.length !== Body.categories.length) throw new BadRequestException('Invalid categories');
            console.log("runned")
            // Create the new device type
            const newDeviceType = new this.deviceTypesModel({
                vendor: Body.vendor,
                deviceType: Body.deviceType,
                imgUrl: Body.imgUrl,
                connectionProtocol: Body.connectionProtocol,
                categories: Body.categories,
                createdBy: user.userId
            });
            return newDeviceType.save();
        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while creating the new device type', error);
        }
    }

    async getAllDeviceTypes(): Promise<DeviceTypesDocument[]> {
        return this.deviceTypesModel.find().exec();
    }

    async updateDeviceType(deviceTypeId: string, Body: CreateNewDeviceTypeDto): Promise<DeviceTypesDocument> {
        try {
            // Check if the device type exists
            const deviceType = await this.deviceTypesModel.findById(deviceTypeId);
            if (!deviceType) throw new BadRequestException('Device type does not exist');

            // Check if the image URL is valid
            const isValidImageUrl = await this.validateImageUrl(Body.imgUrl);
            if (!isValidImageUrl) throw new BadRequestException('Invalid image URL');

            // Check once again on the connection protocols to ensure they are valid
            const validConnectionProtocols = ['serial_port', 'bluetooth', 'wifi'];
            const invalidConnectionProtocols = Body.connectionProtocol.filter(protocol => !validConnectionProtocols.includes(protocol));
            if (invalidConnectionProtocols.length > 0) throw new BadRequestException(`Invalid connection protocols: ${invalidConnectionProtocols.join(', ')}`);

            // Check if the categories are valid
            const categories = await this.blocksCategoryService.getAllAvailableCategoriesFromArray(Body.categories);
            if (categories.length !== Body.categories.length) throw new BadRequestException('Invalid categories');

            // Update the device type
            return this.deviceTypesModel.findByIdAndUpdate(deviceTypeId, Body, { new: true });
        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while modifying the device type');
        }
    }

    async deleteDeviceType(deviceTypeId: string): Promise<{message: string}> {
        try {
            // Check if the device type exists
            const deviceType = await this.deviceTypesModel.findById(deviceTypeId);
            if (!deviceType) throw new BadRequestException('Device type does not exist');

            // Delete the device type
            return {
                message: await this.deviceTypesModel.findByIdAndDelete(deviceTypeId) ? 'Device type deleted successfully' : 'An error occurred while deleting the device type'
            };
        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while deleting the device type');
        }
    }
}
