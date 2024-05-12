import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema({ timestamps: true })
export class ProjectWorkHistory {
  
    @Prop({ required: true, ref: 'users' })
    userId: Types.ObjectId;

    @Prop({ required: true, ref: 'projects' })
    projectId: Types.ObjectId;

    @Prop({ required: true, type: Object})
    workData: Object
}

export const ProjectWorkHistorySchema = SchemaFactory.createForClass(ProjectWorkHistory);
export type ProjectWorkHistoryDocument = HydratedDocument<ProjectWorkHistory>;