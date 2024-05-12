import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class Device {
  
    @Prop({ required: true, type: String, unique: true})
    name: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'DeviceTypes'})
    deviceType: Types.ObjectId;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
export type DeviceDocument = HydratedDocument<Device>;