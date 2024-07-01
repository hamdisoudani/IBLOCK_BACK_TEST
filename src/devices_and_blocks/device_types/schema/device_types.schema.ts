import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BlocksCategory } from "src/devices_and_blocks/blocks/schemas/blocks_category.schema";
import { Users } from "src/users/schemas/users.schema";

export enum ConnectionProtocol {
    SERIAL_PORT = 'serial_port',
    BLUETOOTH = 'bluetooth',
    WIFI = 'wifi',
}
@Schema({ timestamps: true })
export class DeviceTypes {
    @Prop({ required: true, type: String, unique: true})
    deviceType: string;

    @Prop({ required: true, type: String})
    imgUrl: string;

    @Prop({ required: true, type: String})
    vendor: string;

    @Prop({ required: true, enum: ConnectionProtocol,type: Array<String>, default: [ConnectionProtocol.SERIAL_PORT]})
    connectionProtocol: string[];

    @Prop({ required: true, type: [Types.ObjectId], ref: BlocksCategory.name })
    categories: Types.ObjectId[];
    
    @Prop({ required: true, type: Types.ObjectId, ref: Users.name })
    createdBy: Types.ObjectId;
}

export const DeviceTypesSchema = SchemaFactory.createForClass(DeviceTypes);
export type DeviceTypesDocument = HydratedDocument<DeviceTypes>;