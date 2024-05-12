import { UsersService } from 'src/users/users.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { School, schoolDocument } from '../school/schemas/school.schema';
import mongoose, { Model, Types } from 'mongoose';
import { AddSchoolDto } from '../school/dto/add_school.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';
import { JoinSchoolDto } from './dto/join_school.dto';
import { Profile, ProfileType } from 'src/users/schemas/users.schema';

@Injectable()
export class SchoolService {
    constructor(
        @InjectModel(School.name) private readonly schoolModel: Model<School>,
        private readonly usersService: UsersService
    ) {}

    generateInvitationCode(): string {
        const nanoid = customAlphabet(CUSTOM_INVITATION_CODE_ALPHABET, 8);
        return nanoid();
    }

    async findSchoolByName(schoolName: string): Promise<schoolDocument | undefined> {
        try {
            const school = this.schoolModel.findOne({schoolName});
            if(!school) return undefined;

            return school;
        } catch (error) {
            throw new BadRequestException();
        }
    }

    async findSchoolById(schoolId: Types.ObjectId): Promise<schoolDocument | undefined> {
        try {
            const school = this.schoolModel.findById(schoolId);
            if(!school) return undefined;

            return school;
        } catch (error) {
            throw new BadRequestException();
        }
    }

    async findSchoolByInvitationCode(invitationCode: string): Promise<schoolDocument | undefined> {
        try {
            const school = this.schoolModel.findOne({invitationCode});
            if(!school) return undefined;

            return school;
        } catch (error) {
            throw new BadRequestException();
        }
    }

    async addNewSchool(body: AddSchoolDto, accessTokenPayload: accessTokenType) : Promise< {message: string, school: School} > {
        try {
            const school = await this.findSchoolByName(body.schoolName);

            if(school) throw new BadRequestException("There is already a school with this name");

            let invitationCode = this.generateInvitationCode();
            const newSchool = await (new this.schoolModel({ schoolName: body.schoolName , adminId: accessTokenPayload.userId, invitationCode})).save();

            return {
                message: "New school added successfully",
                school: newSchool
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async joinSchool(body: JoinSchoolDto, userData: accessTokenType): Promise<{ message: string }> {
        try {
           const school = await this.findSchoolByInvitationCode(body.invitationCode);
           if(!school) throw new BadRequestException("Invalid invitation code");

           const userIdObjectId = new mongoose.Types.ObjectId(userData.userId);
           if(school.members.includes(userIdObjectId)) throw new BadRequestException("You're already a member of the school");

            school.members.push(userIdObjectId);
            await school.save();
            console.log("working")
            const user = await this.usersService.findUserByEmail(userData.email);
            console.log("user", user)
            if(!user) throw new UnauthorizedException("You're not authorized to perform this action");

            user.profiles.push({
                profileName: school.schoolName,
                type: ProfileType.SCHOOL,
                school: school._id
            })
            await user.save();
            console.log("new user", user)
            return {
                message: "You've successfully join the school"
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
