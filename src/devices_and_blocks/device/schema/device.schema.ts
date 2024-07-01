import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { DeviceTypes } from "src/devices_and_blocks/device_types/schema/device_types.schema";
import { Users } from "src/users/schemas/users.schema";

@Schema({ timestamps: true })
export class Device {
  
    @Prop({ required: true, type: String, unique: true})
    name: string;

    @Prop({ required: true, type: Types.ObjectId, ref: DeviceTypes.name})
    deviceType: Types.ObjectId;

    @Prop({ required: false, type: Boolean, default: false})
    isBeingUsed: boolean;

    @Prop({ required: false, type: Boolean, default: false})
    isOnline: boolean;

    @Prop({ required: true, type: String})
    uniqueId: string;

    @Prop({ required: true, type: Types.ObjectId, ref: Users.name})
    createdBy: Types.ObjectId;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
export type DeviceDocument = HydratedDocument<Device>;