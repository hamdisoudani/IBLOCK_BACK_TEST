import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({timestamps: true})
export class Class {
    @Prop({required: true, unique: true})
    className: string

    @Prop({required: true, unique: true})
    invitationCode: string

    @Prop({required: false})
    classDescription?: string

    @Prop({required: true, ref: 'School'})
    schoolId: Types.ObjectId

    @Prop({required: true, ref: 'Users'})
    ownerId: Types.ObjectId

    @Prop({required: false, ref: 'Users', default: []})
    members: Types.ObjectId[]
}


export const classSchema = SchemaFactory.createForClass(Class);
export type classDocument = HydratedDocument<Class>;