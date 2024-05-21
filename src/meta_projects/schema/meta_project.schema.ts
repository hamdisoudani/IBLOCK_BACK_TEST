import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class MetaProject {
    @Prop({ required: true, type: String})
    projectName: string;

    @Prop({ required: false, type: String, default: ''})
    projectDescription?: string;
    
    @Prop({ required: true, ref: 'users' })
    createdBy: Types.ObjectId;

    @Prop({ required: true, type: Boolean})
    collaborative: boolean;

    @Prop({ required: false, type: String, unique: true})
    invitationCode?: string;

    @Prop({ required: false, ref: 'users'})
    members?: Types.ObjectId[];

    @Prop({ required: false, ref: 'metaprojectcodes'})
    projectCodes?: Types.ObjectId[];

    @Prop({ required: false, ref: 'schools' })
    schoolId?: Types.ObjectId;
}

export const MetaProjectSchema = SchemaFactory.createForClass(MetaProject);
export type MetaProjectDocument = HydratedDocument<MetaProject>;