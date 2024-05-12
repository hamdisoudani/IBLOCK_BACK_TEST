import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { IsMongoId } from "class-validator"
import { HydratedDocument, Types } from "mongoose"

export enum RequestCreateClassStatus {
    PENDING = 'pending',
    REJECTED = 'rejected',
    ACCEPTED = 'accepted'
}
@Schema({ timestamps: true })
export class RequestCreateClass {
    @Prop({ required: true, unique: true })
    className: string

    @Prop({ required: true, ref: 'Users' })
    teacherId: Types.ObjectId

    @Prop({ required: true, ref: 'School' })
    schoolId: Types.ObjectId

    @Prop({ required: false, type: String ,enum: RequestCreateClassStatus, default: RequestCreateClassStatus.PENDING })
    status: string

    @Prop( { required: false, default: ""})
    denyReason: string
}

export const requestCreateClassSchema = SchemaFactory.createForClass(RequestCreateClass);
export type requestCreateClassDocument = HydratedDocument<RequestCreateClass>;