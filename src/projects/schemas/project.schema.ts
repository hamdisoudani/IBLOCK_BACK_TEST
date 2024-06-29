import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum, IsOptional } from "class-validator";
import { HydratedDocument, Types } from "mongoose";
import { Users } from "src/users/schemas/users.schema";

export enum ProjectType {
    PERSONAL = 'personal',
    META_PROJECT = 'meta_project',
    TEAM = 'team'
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  projectName: string;

  @Prop({ required: false, default: ''})
  @IsOptional()
  projectDescription?: string;
  
  @Prop({ required: true, ref: Users.name })
  projectOwner: Types.ObjectId;

  @Prop({ required: true, enum: ProjectType, default: ProjectType.PERSONAL})
  @IsEnum(ProjectType)
  projectType: string;

  @Prop({ required: false, ref: Users.name, default: [] })
  @IsOptional()
  members?: Types.ObjectId[];

  @Prop({ required: false, unique: true })
  @IsOptional()
  invitationCode: string;

  @Prop({ required: false, ref: 'schools' })
  @IsOptional()
  schoolId?: Types.ObjectId;

  @Prop({ required: false, ref: 'classes' })
  @IsOptional()
  classId?: Types.ObjectId;

  @Prop({ required: false, ref: 'metaprojects' })
  @IsOptional()
  metaProjectID?: Types.ObjectId;

  @Prop({ required: false })
  @IsOptional()
  collaborative: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
export type ProjectDocument = HydratedDocument<Project>;