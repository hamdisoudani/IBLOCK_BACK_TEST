import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema({ timestamps: true })
export class ProjectWorkHistory {
    @Prop({ required: true, ref: 'projects' })
    projectId: Types.ObjectId;

    @Prop({ required: false, type: String})
    workData?: string

    @Prop({ required: false, type: String})
    mainCopy?: string

    @Prop({ required: false, type: Types.ObjectId, ref: 'users' })
    lastSaveBy?: Types.ObjectId
}

export const ProjectWorkHistorySchema = SchemaFactory.createForClass(ProjectWorkHistory);
export type ProjectWorkHistoryDocument = HydratedDocument<ProjectWorkHistory>;