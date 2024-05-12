import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Class, classDocument } from './schemas/class.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateClassDto } from './dto/create_class.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { ProfileType, Role } from 'src/users/schemas/users.schema';
import { ProfileService } from 'src/profile/profile.service';
import { SchoolService } from 'src/school/school.service';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';
import { JoinClassDto } from './dto/join_class.dto';
import { ClassDetailsResponse } from './types/class_detail_response.type';
import { ProjectsService } from 'src/projects/projects.service';
import { fetchClassInformationPipeline } from './pipelines/class_information.pipeline';
import { getEnabledCategories } from 'trace_events';
import { getEnrolledClassesBySchool } from './pipelines/get_enrolled_classes_by_school.pipiline';

@Injectable()
export class ClassService {
    constructor(
        @InjectModel(Class.name) private readonly classModel: Model<Class>,
        private readonly profileService: ProfileService,
        private readonly schoolService: SchoolService,
        private readonly projectService: ProjectsService
    ) {}

    generateInvitationCode(): string {
        const nanoid = customAlphabet(CUSTOM_INVITATION_CODE_ALPHABET, 8);
        return nanoid();
    }

    async getClassByName(className: string): Promise<classDocument | null> {
        try {
            const classData = await this.classModel.findOne({ className });

            if(classData) return classData;

            return null;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async getClassById(classId: string): Promise<classDocument | null> {
        try {
            const classData = await this.classModel.findById(classId);

            if(classData) return classData;

            return null;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async createClass(body: CreateClassDto, user: accessTokenType): Promise<classDocument | undefined> {
        try {
            // Check if the current user role is a teacher
            if(user.role != Role.TEACHER) throw new UnauthorizedException("You're not authorized to perform this action", user.role);

            // Check if the current user profile is with type teacher
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type != ProfileType.SCHOOL) throw new UnauthorizedException("Switch your current profile to the school profile to continue");
            console.log("ruun")
            // Check if the current teacher is already joined the school ( for security )
            const school = this.schoolService.findSchoolById(selectedProfile.school);
            console.log("ruun1")
            if(!school) throw new BadRequestException("The school was not found or you are not a member of the school");

            // Check if there is a class with the requested class name
            const isClass = await this.getClassByName(body.className);
            if(isClass) throw new BadRequestException("A class with the provided name already exist please try another name");

            // If no error proceceed with the class creation
            const invitationCode = this.generateInvitationCode()
            const classModel = new this.classModel({
                schoolId: selectedProfile.school,
                className: body.className,
                classDescription: body.classDescription || "",
                ownerId: new Types.ObjectId(user.userId),
                invitationCode
            });

            const newClass = await classModel.save()
            console.log("ruun2")
            if(!newClass) throw new BadRequestException("Something went wrong !")

            return newClass
        } catch (error) {
            throw new UnauthorizedException("You're not authorized to perform this action", error);
        }
    }

    async joinClass(body: JoinClassDto, userData: accessTokenType): Promise<{ message: string }> {
        try {

            // Check if the invitation code is valid
            const classByIC = await this.classModel.findOne({ invitationCode: body.invitationCode });
            if(!classByIC) throw new BadRequestException("Invalid invitation code");

            // Check if the current profile match the class school
            const { selectedProfile } = await this.profileService.getUserProfiles(userData);

            if(selectedProfile.type != ProfileType.SCHOOL) throw new BadRequestException("You cannot join this class from a personal profile");

            if(!selectedProfile.school.equals(classByIC.schoolId)) throw new BadRequestException("You cannot join a class from a different school profile");

            // Check if the current user is already a member
            if(classByIC.members.includes(new mongoose.Types.ObjectId(userData.userId))) throw new BadRequestException("You're already a member of the class");

            
            // If no error let the user join that class
            classByIC.members.push(new mongoose.Types.ObjectId(userData.userId));
            await classByIC.save();

            return {
                message: "You've successfully joined this class"
            }
        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException();
        }
    }

    async getClassInformation(classId: string, userData: accessTokenType): Promise<classDocument> {
        try {
            const schoolClass = await this.classModel.findById(classId);
            if(!schoolClass) throw new BadRequestException("This class was not found");

            // Check if the current profile match the class school
            const { selectedProfile } = await this.profileService.getUserProfiles(userData);

            if(selectedProfile.type != ProfileType.SCHOOL) throw new BadRequestException("You cannot access to this class from a personal profile");

            if(!selectedProfile.school.equals(schoolClass.schoolId)) throw new BadRequestException("You can't access to this class information from a different school profile");

            // Check if the current user is already a member
            if(!schoolClass.members.includes(new mongoose.Types.ObjectId(userData.userId))) throw new UnauthorizedException("You're not authorized to perform this action")

            
            // const fullClassDetails = await (await (await schoolClass.populate({ path : 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }})
            // ).populate({path: 'schoolId', select: {"_id": 1, "schoolName": 1, "invitationCode": 1}})).populate({ path: 'ownerId', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }});
            // return fullClassDetails;
            const members = await schoolClass.populate({ path : 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }});
            const getSchoolInformation = await this.schoolService.findSchoolById(schoolClass._id);
            const projects = await this.projectService.getProjectsByClass(classId);

            // Use mongodb aggregation pipelines to get class school information
            const pipeline = fetchClassInformationPipeline(classId);
            const finalOutput = await this.classModel.aggregate(pipeline);
            return finalOutput[0];
        } catch (error) {
            throw error;
        }
    }

    async getEnrolledClasses(userData: accessTokenType): Promise<classDocument[]> {
        try {
            // Check if the user is using the profile of type school
            const { selectedProfile } = await this.profileService.getUserProfiles(userData);
            if(selectedProfile.type != ProfileType.SCHOOL) throw new UnauthorizedException("Switch your current profile to the school profile to continue");

            // Check if the current user is member of that school
            const school = await this.schoolService.findSchoolById(selectedProfile.school);
            if(!school) throw new BadRequestException("The school was not found");
            if(!school.members.includes(new mongoose.Types.ObjectId(userData.userId))) throw new UnauthorizedException("You're not authorized to perform this action");

            // Get all classes by current school profile where he is a member
            const pipeline = getEnrolledClassesBySchool(selectedProfile.school, userData.userId);
            const classes = await this.classModel.aggregate(pipeline);
            return classes;
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            } else {
                throw new InternalServerErrorException("server error");
            }
        }
    }
}
