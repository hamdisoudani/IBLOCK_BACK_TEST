import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema({ timestamps: true })
export class MetaProjectCodes {
    @Prop({ required: true, unique: true})
    code: string;

    @Prop({ required: false, default: 6 })
    maxUsers: number;

    @Prop({ required: false, default: [], ref: 'users'})
    members: Types.ObjectId[];

    @Prop({ required: false, default: "" })
    childProjectName?: string;

    @Prop({ required: false, default: "" })
    childProjectDescription?: string;

    @Prop({ required: true, ref: 'metaprojects'})
    metaProjectID: Types.ObjectId;
}

export const MetaProjectCodesSchema = SchemaFactory.createForClass(MetaProjectCodes);
export type MetaProjectCodesDocument = HydratedDocument<MetaProjectCodes>;