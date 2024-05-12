import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum, IsOptional } from "class-validator";
import { HydratedDocument, Types } from "mongoose";

export enum ProjectType {
    PERSONAL = 'personal',
    TEAM = 'team'
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  projectName: string;

  @Prop({ required: false, default: ''})
  @IsOptional()
  projectDescription?: string;
  
  @Prop({ required: true, ref: 'Users' })
  projectOwner: Types.ObjectId;

  @Prop({ required: true, enum: ProjectType, default: ProjectType.PERSONAL})
  @IsEnum(ProjectType)
  projectType: string;

  @Prop({ required: false, ref: 'Users', default: [] })
  @IsOptional()
  members?: Types.ObjectId[];

  @Prop({ required: true, unique: true })
  @IsOptional()
  invitationCode: string;

  @Prop({ required: false, ref: 'School' })
  @IsOptional()
  schoolId?: Types.ObjectId;

  @Prop({ required: false, ref: 'Class' })
  @IsOptional()
  classId?: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = HydratedDocument<Project>;