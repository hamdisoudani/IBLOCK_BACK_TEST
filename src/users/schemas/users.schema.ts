import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum, IsOptional } from "class-validator";
import { HydratedDocument, Types } from "mongoose";

export enum Role {
    ADMIN = 'admin',
    STUDENT = 'student',
    TEACHER = 'teacher',
    ROBOTADMIN= "robot_admin",
    SUPER_ADMIN = 'super_admin'
}

export enum ProfileType {
    PERSONAL = 'personal',
    // COMPANY = 'company',
    SCHOOL = 'school'
}

@Schema({ timestamps: true })
export class Profile {
    @Prop({ required: true, enum: ProfileType })
    @IsEnum(ProfileType)
    type: string 

    @Prop({required: true})
    profileName: string

    @Prop({ type: Types.ObjectId, ref: 'School', required: false })
    @IsOptional() 
    school?: Types.ObjectId;

    // @Prop({ type: Types.ObjectId, ref: 'Company', required: false })
    // @IsOptional() 
    // company?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Users {

    @Prop({ required: true, unique: true })
    email: string

    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true, enum: Role, default: Role.STUDENT })
    @IsEnum(Role)
    role: string

    @Prop({ type: [Profile] })
    profiles: Profile[];
}

export const usersSchema = SchemaFactory.createForClass(Users);
export type usersDocument = HydratedDocument<Users>;
export type profileDocument = HydratedDocument<Profile>;