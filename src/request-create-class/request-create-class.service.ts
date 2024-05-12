import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RequestCreateClass } from './schema/request-create-class.schema';
import { Model } from 'mongoose';
import { CreateClassRequestDto } from './dto/create_class_request.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { ProfileService } from 'src/profile/profile.service';
import { Role } from 'src/users/schemas/users.schema';
import { ClassService } from 'src/class/class.service';

@Injectable()
export class RequestCreateClassService {
    constructor(
        @InjectModel(RequestCreateClass.name) private  readonly requestCreateClassModel: Model<RequestCreateClass>,
        private readonly profileService: ProfileService,
        private readonly classService: ClassService
    ) {}


    async createRequest(body: CreateClassRequestDto, user: accessTokenType): Promise<{message: string}> {
        try {
            // Get user current profile data
            const {selectedProfile} = await this.profileService.getUserProfiles(user);
            if(!selectedProfile) throw new BadRequestException("Profile not found");

            // Check if the current user role is a teacher
            if(user.role != Role.TEACHER) throw new BadRequestException("You're not authorized to perform this action");

            // Check if the class is already exists
            const classDocument = await this.classService.getClassByName(body.className);
            if(classDocument) throw new BadRequestException("A class with this name already exists");

            // Check if the teacher exceeded the limit of pending classes requests
            const classRequests = await this.requestCreateClassModel.find({ teacherId: user.userId, status: "pending" });
            if(classRequests.length >= 5) throw new BadRequestException("You exceeded the limit please wait for the admin to approve the pending requests");

            // Check if the class name already exists
            const classRequest = await this.requestCreateClassModel.findOne({ className : body.className, schoolId: selectedProfile.school, teacherId: user.userId});
            if(classRequest && classRequest.status === "pending") return {message: "You already have a pending request to create a class with this name. Please wait for the admin to approve it."};

            // Create the class request
            const newClassRequest = new this.requestCreateClassModel({
                className: body.className,
                teacherId: user.userId,
                schoolId: selectedProfile.school
            });
            const savedClassRequest = await newClassRequest.save();
            if(!savedClassRequest) throw new InternalServerErrorException();
            return {message: "Class request created successfully"};
        } catch (error) {
            throw error;
        }
    }

    async getRequests(user: accessTokenType): Promise<RequestCreateClass[]> {
        try {
            const {selectedProfile} = await this.profileService.getUserProfiles(user);
            if(!selectedProfile) throw new BadRequestException("Profile not found");

            const requests = await this.requestCreateClassModel.find({ schoolId: selectedProfile.school, teacherId: user.userId }).populate("schoolId", "schoolName").exec();
            return requests;
        } catch (error) {
            throw error;
        }
    }

    async acceptRequest(requestId: string, user: accessTokenType): Promise<{message: string}> {
        try {
            const {selectedProfile} = await this.profileService.getUserProfiles(user);
            if(!selectedProfile) throw new BadRequestException("Profile not found");

            const request = await this.requestCreateClassModel.findOne({ _id: requestId, status: "pending" });
            if(!request) throw new BadRequestException("Request not found or already accepted/rejected");

            const classDocument = await this.classService.createClass({ className: request.className }, user);
            if(!classDocument) throw new InternalServerErrorException();
            // Update the request status
            request.status = "accepted";
            await request.save();
            return {message: "Request accepted successfully"};
        } catch (error) {
            throw error;
        }
    }
}
