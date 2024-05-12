import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export enum ConnectionProtocol {
    SERIAL_PORT = 'serial_port',
    BLUETOOTH = 'bluetooth',
    WIFI = 'wifi',
}
@Schema({ timestamps: true })
export class DeviceTypes {
    @Prop({ required: true, type: String, unique: true})
    deviceType: string;

    @Prop({ required: false, type: String})
    imgUrl: string;

    @Prop({ required: false, type: String})
    vendor: string;

    @Prop({ required: true, type: String, enum: ConnectionProtocol, default: ConnectionProtocol.SERIAL_PORT})
    connectionProtocol: ConnectionProtocol[];


}

export const DeviceTypesSchema = SchemaFactory.createForClass(DeviceTypes);
export type DeviceTypesDocument = HydratedDocument<DeviceTypes>;