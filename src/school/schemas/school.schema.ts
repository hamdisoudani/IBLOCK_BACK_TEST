import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class School {
    @Prop({ required: true, unique: true })
    schoolName: string

    @Prop({ required: true, unique: true })
    invitationCode: string

    @Prop({ required: true, ref: 'Users' })
    adminId: Types.ObjectId

    @Prop({ ref: 'Users', required: false, default: [] })
    members?: Types.ObjectId[]
}

export const schoolSchema = SchemaFactory.createForClass(School);
export type schoolDocument = HydratedDocument<School>