import { UsersService } from 'src/users/users.service';
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { School, schoolDocument } from '../school/schemas/school.schema';
import mongoose, { Model, Types } from 'mongoose';
import { AddSchoolDto } from '../school/dto/add_school.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';
import { JoinSchoolDto } from './dto/join_school.dto';
import { ProfileType, Role, usersDocument } from 'src/users/schemas/users.schema';
import { ProjectDocument, ProjectType } from 'src/projects/schemas/project.schema';
import { ProjectsService } from 'src/projects/projects.service';
import { GetInformationAboutUserDto } from './dto/get_information_about_user.dto';
import { ChangeSchoolAdminDto } from './dto/change_admin.dto';

@Injectable()
export class SchoolService {
    constructor(
        @InjectModel(School.name) private readonly schoolModel: Model<School>,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        @Inject(forwardRef(() => ProjectsService)) private readonly projectsService: ProjectsService
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

    async addNewSchool(body: AddSchoolDto) : Promise< {message: string, school: schoolDocument, adminSchool: usersDocument} > {
        try {
            const school = await this.findSchoolByName(body.schoolName);

            if(school) throw new BadRequestException("There is already a school with this name");

            
            //const newSchool = await (new this.schoolModel({ schoolName: body.schoolName , adminId: accessTokenPayload.userId, invitationCode})).save();
            // We will get the new school admin (email and password) and register him , then we add the school ID to the user and the smae for school
            
            // First we check if there's a user with the provided email or not
            const user = await this.usersService.findUserByEmail(body.email);
            if(user) throw new BadRequestException("There is already a user with this email");

            // Then we create a new user
            const newUser = await this.usersService.createNewUser({
                email: body.email,
                password: body.password,
                role: Role.SCHOOL_ADMIN,
                name: body.adminName
            });

            if(!newUser) throw new BadRequestException("Failed to create a new user");
            
            // Generate always unique invitation code
            let invitationCode = this.generateInvitationCode();
            let getSchoolByInvitationCode = await this.schoolModel.exists({invitationCode});
            while(getSchoolByInvitationCode) {
                invitationCode = this.generateInvitationCode();
                getSchoolByInvitationCode = await this.schoolModel.exists({invitationCode});
            }
            // Then we create a new school
            const newSchool = await (new this.schoolModel({ schoolName: body.schoolName , adminId: newUser._id, invitationCode})).save();

            if(!newSchool) throw new BadRequestException("Failed to create a new school");

            // Then we add the school ID to the user
            newUser.schoolID = newSchool._id;
            await newUser.save();

            // Specify only name, email, id for the user created
            newUser.password = undefined;
            newUser.profiles = undefined;

            return {
                message: "New school added successfully",
                school: newSchool,
                adminSchool: newUser
            }
        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
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

    async getSchoolStatsForSuperAdmin(): Promise< {totalSchools: number, recentSchools: schoolDocument[] } > {
        try {
            const totalSchools = await this.schoolModel.countDocuments();
            const recentSchools = await this.schoolModel.find().sort({createdAt: -1}).limit(5);
            return {
                totalSchools,
                recentSchools
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async getAllSchoolsJoinedByUser(userID: string ): Promise<schoolDocument[]> {
        try {
            const schools = await this.schoolModel.find({members: new Types.ObjectId(userID)});
            return schools;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async getAllJoinedStudent(schoolID: string): Promise<schoolDocument> {
        try {
            const users = await this.schoolModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId("65f4632aefcf71ad374f36e1")
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'members',
                        foreignField: '_id',
                        as: 'membersDetails',
                        // Get created projects count for each user
                        pipeline: [
                            
                            {
                                $lookup: {
                                    from: 'projects',
                                    localField: "_id",
                                    foreignField: 'projectOwner',
                                    as: 'projectsSize',
                                    pipeline: [
                                        {
                                            $match: {
                                                schoolId: new Types.ObjectId("65f4632aefcf71ad374f36e1"),
                                                projectType: ProjectType.META_PROJECT
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $lookup: {
                                    from: 'metaprojects',
                                    localField: "_id",
                                    foreignField: 'createdBy',
                                    as: 'mpSize',
                                    pipeline: [
                                        {
                                            $match: {
                                                schoolId: new Types.ObjectId("65f4632aefcf71ad374f36e1")
                                            }
                                        }
                                    ]
                                }
                            },
                            // If the user is student then lookup for the projects he joined and if he is teacher then lookup for the projects he created
                            {
                                $lookup: {
                                    from: 'projects',
                                    localField: "_id",
                                    foreignField: 'members',
                                    as: 'joinedProjects',
                                    pipeline: [
                                        {
                                            $match: {
                                                schoolId: new Types.ObjectId("65f4632aefcf71ad374f36e1")
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    projectsCount: {
                                        $cond: {
                                            if: { $isArray: "$projectsSize" },
                                            then: { $size: "$projectsSize" },
                                            else: 0
                                        }
                                    },
                                    mpCount: {
                                        $cond: {
                                            if: { $isArray: "$mpSize" },
                                            then: { $size: "$mpSize" },
                                            else: 0
                                        }
                                    
                                    },
                                    joinedProjectCount: {
                                        $cond: {
                                            if: { $isArray: "$joinedProjects" },
                                            then: { $size: "$joinedProjects" },
                                            else: 0
                                        }
                                    
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    email: 1,
                                    name: 1,
                                    role: 1,
                                    projectsCount: 1,
                                    mpCount: 1,
                                    joinedProjectCount: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 0,
                        schoolName: 1,
                        membersDetails: 1
                    }
                }
            ]);
            return users[0];
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async getStatsForCurrentSchool(schoolID: string): Promise< {schoolName: string, totalMembers: number, studentsCount: number, teachersCount: number, projectsCount: number, metaProjectsCount: number, projectsDetails: any[], metaProjectsDetails: any[] } > {
        try {
            // Get all users count
            const details = await this.schoolModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId("65f4632aefcf71ad374f36e1")
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'members',
                        foreignField: '_id',
                        as: 'membersDetails',
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    email: 1,
                                    name: 1,
                                    role: 1
                                }
                            }
                        ]
                    },
                    
                },
                // Get all projects under this school
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: 'schoolId',
                        as: 'projectsDetails',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'projectOwner',
                                    foreignField: '_id',
                                    as: 'projectOwnerDetails',
                                    pipeline: [
                                        {
                                            $project: {
                                                _id: 1,
                                                email: 1,
                                                name: 1,
                                                role: 1
                                            }
                                        }
                                    ]
                                
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    projectName: 1,
                                    projectType: 1,
                                    projectOwnerDetails: 1,
                                    members: {
                                        $cond: {
                                            if: { $isArray: "$members" },
                                            then: { $size: "$members" },
                                            else: 0
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                // Get all metaprojects under this school
                {
                    $lookup: {
                        from: 'metaprojects',
                        localField: '_id',
                        foreignField: 'schoolId',
                        as: 'metaProjectsDetails',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'createdBy',
                                    foreignField: '_id',
                                    as: 'createdByDetails',
                                    pipeline: [
                                        {
                                            $project: {
                                                _id: 1,
                                                email: 1,
                                                name: 1,
                                                role: 1
                                            }
                                        }
                                    ]
                                
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    projectName: 1,
                                    projectType: 1,
                                    createdByDetails: 1,
                                    members: {
                                        $cond: {
                                            if: { $isArray: "$members" },
                                            then: { $size: "$members" },
                                            else: 0
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },

                {
                    $addFields: {
                        totalMembers: {
                            $size: "$membersDetails"
                        },
                        // Count the number of students
                        studentsCount: {
                            $size: {
                                $filter: {
                                    input: "$membersDetails",
                                    as: "member",
                                    cond: { $eq: ["$$member.role", Role.STUDENT] }
                                }
                            }
                        },
                        // Count the number of teachers
                        teachersCount: {
                            $size: {
                                $filter: {
                                    input: "$membersDetails",
                                    as: "member",
                                    cond: { $eq: ["$$member.role", Role.TEACHER] }
                                }
                            }
                        },  
                        // Count the number of projects
                        projectsCount: {
                            $size: "$projectsDetails"
                        },
                        // Count the number of metaprojects
                        metaProjectsCount: {
                            $size: "$metaProjectsDetails"
                        }
                        
                    }
                },
                {
                    // Display data and only last 5 projects
                    $project: {
                        _id: 0,
                        schoolName: 1,
                        totalMembers: 1,
                        studentsCount: 1,
                        teachersCount: 1,
                        projectsCount: 1,
                        metaProjectsCount: 1,
                        projectsDetails: { $slice: ["$projectsDetails", -5] },
                        metaProjectsDetails: { $slice: ["$metaProjectsDetails", -5] }
                    }
                }
            ]);
            return details[0];
        } catch (error) {
            throw new InternalServerErrorException("Internal Server Error");
        }
    }

    async getInformationAboutUser(user: accessTokenType, body: GetInformationAboutUserDto): Promise< {userInformation: usersDocument, getUserProjects: ProjectDocument[]} > {
        try {
            const school = await this.schoolModel.findById(user.schoolId);
            if(!school) throw new BadRequestException("School not found");

            // Check if the user is a member of the school
            const userObjectId = new mongoose.Types.ObjectId(body.userID);
            if(!school.members.includes(userObjectId)) throw new BadRequestException("User is not a member of the school");
            
            const userInformation = await this.usersService.getUserInformation(body.userID);

            const getUserProjects = await this.projectsService.getProjectsUnderSchool(body.userID, user.schoolId);

            return {
                userInformation,
                getUserProjects
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async changeSchoolAdmin(body: ChangeSchoolAdminDto): Promise<{message: string, newAdmin: usersDocument}> {
        try {
            const school = await this.findSchoolById(new Types.ObjectId(body.schoolID));
            if(!school) throw new BadRequestException("School not found");

            // Check if the school has already an admin
            // If the school has an admin then we will change the admin and remove the old one
            if(school.adminId) {
                const oldAdmin = await this.usersService.findUserById(school.adminId.toString());
                if(!oldAdmin) throw new BadRequestException("Old admin not found");

                // If the admin found we completely remove him from the database
                await this.usersService.deleteUser(oldAdmin._id.toString());
            }

            // Then we create a new user
            const newUser = await this.usersService.createNewUser({
                email: body.adminEmail,
                password: body.adminPassword,
                role: Role.SCHOOL_ADMIN,
                name: body.adminName
            });

            // Then we add the school ID to the user
            newUser.schoolID = school._id;
            await newUser.save();


            // Update the school admin ID
            school.adminId = newUser._id;
            await school.save();

            // We return with the message the new admin (email, name, id)
            newUser.password = undefined;
            newUser.profiles = undefined;

            return {
                message: "School admin changed successfully",
                newAdmin: newUser
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
