import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument, ProjectType } from './schemas/project.schema';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from './dto/create_project.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { ProfileService } from 'src/profile/profile.service';
import { ProfileType, Role } from 'src/users/schemas/users.schema';
import { ClassService } from 'src/class/class.service';
import { ProjectWorkHistory, ProjectWorkHistoryDocument } from './schemas/work_history.schema';
import { StoreUserWorkDto } from './dto/store_user_work.dto';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';
import { UpdateProjectDto } from './dto/update_project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private readonly projectModel: Model<Project>,
        @InjectModel(ProjectWorkHistory.name) private readonly ProjectWorkHistoryModel: Model<ProjectWorkHistory>,
        private readonly profileService: ProfileService,
        @Inject(forwardRef(() => ClassService)) private readonly classService: ClassService
    ) {}

    generateInvitationCode(): string {
        const nanoid = customAlphabet(CUSTOM_INVITATION_CODE_ALPHABET, 8);
        return nanoid();
    }

    async createProject(body: CreateProjectDto, user: accessTokenType): Promise<ProjectDocument> {
        try {
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type == ProfileType.PERSONAL) {
                
                const projectModel = new this.projectModel({
                    projectName: body.name,
                    projectDescription: body.description || "",
                    projectType: ProjectType.PERSONAL,
                    projectOwner: new Types.ObjectId(user.userId),
                    invitationCode: this.generateInvitationCode()
                });
                
                return await projectModel.save();
            }

            if(selectedProfile.type == ProfileType.SCHOOL && user.role != Role.TEACHER) throw new UnauthorizedException("You're not authorized to add a new project");
            
            // Check if classId is in the request body
            if(!body.classId || body.classId == "") throw new BadRequestException("You need to pick a class for your new project");

            // Check if the class exists
            const classData = await this.classService.getClassById(body.classId);
            if(!classData) throw new BadRequestException("Class doesn't exist");

            // Check if the current school project match the current user profile
            if(!classData.schoolId.equals(selectedProfile.school)) throw new UnauthorizedException("You're not authorized");

            // Check if the user is member in the class
            if(!classData.members.includes(new Types.ObjectId(user.userId))) throw new UnauthorizedException("You must be a member of the class to add new projects")

            const schoolId = selectedProfile.school;
            const projectModel = new this.projectModel({
                projectName: body.name,
                projectDescription: body.description,
                projectType: ProjectType.TEAM,
                projectOwner: new Types.ObjectId(user.userId),
                schoolId,
                classId: new Types.ObjectId(body.classId),
                invitationCode: this.generateInvitationCode()
            });

            return await projectModel.save();
        } catch (error) {
            if(error instanceof BadRequestException ||error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async getProjectById(projectId: string): Promise<ProjectDocument> {
        try {
            const project = await this.projectModel.findById(projectId);
            if(!project) throw new BadRequestException("Project not found");
            return project;
        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async joinProject(invitationCode: string, user: accessTokenType): Promise<ProjectDocument> {
        try {
            // Check if this project already exists
            const isProjectExists = await this.projectModel.exists({ invitationCode });
            if(!isProjectExists) throw new BadRequestException("Project not found");

            const project = await this.projectModel.findOne({ invitationCode });
            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the current user school profile match the project's school
            if(project.schoolId && !project.schoolId.equals(selectedProfile.school)) throw new BadRequestException("You can't join a school project with different school profile");

            // Check if the user is the owner of the project
            if(project.projectOwner.equals(new Types.ObjectId(user.userId))) throw new BadRequestException("You can't join your own project")

            // Check if the user profile type match the project type
            if(project.projectType == ProjectType.PERSONAL && selectedProfile.type == ProfileType.SCHOOL) throw new BadRequestException("You're not authorized to join this project");
            if(project.projectType == ProjectType.TEAM && selectedProfile.type == ProfileType.PERSONAL) throw new BadRequestException("You're not authorized to join this project");

            // Check if the user is already a member of this project
            if(project.members.includes(new Types.ObjectId(user.userId))) throw new BadRequestException("You're already a member of this project");

            // Add the user to the project
            project.members.push(new Types.ObjectId(user.userId));
            await project.save();
            const {projectDetails} = await this.getProjectGeneralInformation(project._id.toString(), user);
            return projectDetails;
        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async leaveProject(projectId: string, user: accessTokenType): Promise<{ message : string}> {
        try {
            // Check if the project exist
            const isProjectExists = await this.projectModel.exists({ _id: projectId });
            if(!isProjectExists) throw new BadRequestException("Project not found");

            const project = await this.getProjectById(projectId);
            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the user is the owner of the project
            if(project.projectOwner.equals(new Types.ObjectId(user.userId))) throw new BadRequestException("You can't leave your own project");

            // Check if the user profile match the project type
            if(project.projectType == ProjectType.PERSONAL && selectedProfile.type == ProfileType.SCHOOL) throw new BadRequestException("You're not authorized to leave this project");
            if(project.projectType == ProjectType.TEAM && selectedProfile.type == ProfileType.PERSONAL) throw new BadRequestException("You're not authorized to leave this project");

            // Check if the user is a member of this project
            if(!project.members.includes(new Types.ObjectId(user.userId))) throw new BadRequestException("You're not a member of this project");

            // Remove the user from the project
            project.members = project.members.filter(member => !member.equals(new Types.ObjectId(user.userId)));
            await project.save();
            return { message: "You've left the project successfully" };
        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async getAllProjectsForTheCurrentProfile(user: accessTokenType): Promise<{ownedProjects: ProjectDocument[], joinedProjects: ProjectDocument[]}> {
        try {
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            const projection = {
                "_id": 1,
                "projectName": 1,
                "projectDescription": 1,
                "projectOwner": 1,
                "projectType": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "invitationCode": 1,
                "__v": 1
            }
            if(selectedProfile.type == ProfileType.PERSONAL) {
                // Get joined projects
                const joinedProjects = await this.projectModel.find({ members: new Types.ObjectId(user.userId) }).select(projection).populate({ path: 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }});
                
                // Get owned projects
                const ownedProjects = await this.projectModel.find({ projectOwner: new Types.ObjectId(user.userId) }).select(projection).populate({ path: 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }});
                
                return {
                    ownedProjects,
                    joinedProjects
                }
            }
            // Get joined projects
            const joinedProjects = await this.projectModel.find({ schoolId: selectedProfile.school, members: new Types.ObjectId(user.userId) }).select(projection).populate({ path: 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }}).populate('projectOwner');
                
            // Get owned projects
            const ownedProjects = await this.projectModel.find({ schoolId: selectedProfile.school, projectOwner: new Types.ObjectId(user.userId) }).select(projection).populate({ path: 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 }});

            return {
                ownedProjects,
                joinedProjects
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getProjectsByClass(classId: string): Promise<ProjectDocument[]> {
        try {
            // Check if the class exist
            const isClassExist = this.classService.getClassById(classId);
            if(!isClassExist) throw new BadRequestException("Class not found");

            const allProjects = this.projectModel.find({ classId })

            return allProjects;
        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async storeUserWorkData(body: StoreUserWorkDto, user: accessTokenType): Promise<{ message: string }> {
        try {
            const {workData, projectId} = body;
            // Check if the project exist
            const isProjectExists = await this.projectModel.exists({ _id: projectId });
            if(!isProjectExists) throw new BadRequestException("Project not found");

            const project = await this.getProjectById(projectId);
            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the current user profile type match the project type
            if(selectedProfile.type == ProfileType.PERSONAL &&  project.projectType == ProjectType.TEAM) throw new BadRequestException("You're not authorized to add work data to this project");
            // Check the role of the user in the current project if he is owner or member
            let role = "";  
            if(project.projectOwner.equals(new Types.ObjectId(user.userId))) role = "owner";
            if(project.members.find(member => member._id.equals(new Types.ObjectId(user.userId)))) role = "member";  

            if(role == "") throw new UnauthorizedException("You're not authorized to perform this action");
            // Check if the user is a member of the project
            //if(!project.members.includes(new Types.ObjectId(user.userId))) throw new BadRequestException("You're not a member of this project");

            // Check if the user already have an old data with the project
            const isOldDataExists = await this.ProjectWorkHistoryModel.exists({ projectId: new Types.ObjectId(projectId), userId: new Types.ObjectId(user.userId) });

            // If there is old record then update the work data
            if(isOldDataExists) {
                const oldRecord = await this.ProjectWorkHistoryModel.findOne({ projectId: new Types.ObjectId(projectId), userId: new Types.ObjectId(user.userId) });
                oldRecord.workData = body.workData;
                await oldRecord.save();

                return {
                    message: "Work data updated successfully X"
                }
            }
            // If the user doesn't have old record then create a new one
            const newRecord = new this.ProjectWorkHistoryModel({
                userId: new Types.ObjectId(user.userId),
                projectId: new Types.ObjectId(projectId),
                workData
            });
            await newRecord.save();
            return {
                message: "Work data updated successfully"
            }
        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async removeUserProject(projectId: string, user: accessTokenType): Promise<{ message: string }> {
        try {
            // Check if the project exist
            const isProjectExists = await this.projectModel.exists({ _id: projectId });
            if(!isProjectExists) throw new BadRequestException("Project not found");

            const project = await this.getProjectById(projectId);
            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the user is the owner of the project
            if(!project.projectOwner.equals(new Types.ObjectId(user.userId))) throw new BadRequestException("You're not authorized to remove this project");

            // Check if the user profile type match the project type
            if(project.projectType == ProjectType.PERSONAL && selectedProfile.type == ProfileType.SCHOOL) throw new BadRequestException("You're not authorized to remove this project");
            if(project.projectType == ProjectType.TEAM && selectedProfile.type == ProfileType.PERSONAL) throw new BadRequestException("You're not authorized to remove this project");

            // Delete joined users work history
            await this.ProjectWorkHistoryModel.deleteMany({ projectId: new Types.ObjectId(projectId) });

            await this.projectModel.deleteOne({ _id: projectId });

            return { message: "Project removed successfully" };
        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async getProjectInformation(projectId: string, user: accessTokenType): Promise<{projectDetails: ProjectDocument, workHistory: ProjectWorkHistoryDocument, role: string}> {
        try {
            const project: ProjectDocument = await this.getProjectById(projectId);
            if(!project) throw new BadRequestException("Project not found");
            
            // Check if the user has access to the project using the current profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type == ProfileType.PERSONAL && project.projectType == ProjectType.TEAM) throw new UnauthorizedException("You're not authorized to access this project");
            if(selectedProfile.type == ProfileType.SCHOOL && project.schoolId && !project.schoolId.equals(selectedProfile.school)) throw new UnauthorizedException("You're not authorized to access this project");
            if(selectedProfile.type == ProfileType.SCHOOL && project.projectType == ProjectType.PERSONAL) throw new UnauthorizedException("You're not authorized to access this project");
            // Get the project information and populate the members
            const projectDetails = await project.populate({ path: 'members', select: { "_id": 1, "name": 1, "email": 1, "role": 1 } });

            // Check the role of the user in the current project if he is owner or member
            let role = "";  
            if(projectDetails.projectOwner.equals(new Types.ObjectId(user.userId))) role = "owner";
            if(projectDetails.members.find(member => member._id.equals(new Types.ObjectId(user.userId)))) role = "member";  

            if(role == "") throw new UnauthorizedException("You're not authorized to access this project");

            // Check if the user is a member of the project
            //if(!project.members.includes(new Types.ObjectId(user.userId))) throw new UnauthorizedException("You're not authorized to access this project");
            
            

            // Get the work history of the user
            const projectIdToMongoId = new Types.ObjectId(projectId);
            const workHistory = await this.ProjectWorkHistoryModel.findOne({ projectId: projectIdToMongoId, userId: new Types.ObjectId(user.userId)  }).exec();

            
            return {
                projectDetails,
                workHistory,
                role
            }

        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async checkUserPermissionToAccessProject(projectId: string, user: accessTokenType): Promise<boolean> {
        try {
            const project: ProjectDocument = await this.projectModel.findOne({ _id: new Types.ObjectId(projectId) });
            if(!project) return false;
            
            // Check if the user has access to the project using the current profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type == ProfileType.PERSONAL && project.projectType == ProjectType.TEAM) return false;
            if(selectedProfile.type == ProfileType.SCHOOL && project.schoolId && !project.schoolId.equals(selectedProfile.school)) return false;
            if(selectedProfile.type == ProfileType.SCHOOL && project.projectType == ProjectType.PERSONAL) return false;

            // Check the role of the user in the current project if he is owner or member
            let role = "";  
            if(project.projectOwner.equals(new Types.ObjectId(user.userId))) role = "owner";
            if(project.members.includes(new Types.ObjectId(user.userId))) role = "member";  

            if(role == "") return false;

            return true;

        } catch (error) {
            return false;
        }
    }

    async checkUserPermissionToEditProject(projectId: string, user: accessTokenType): Promise<boolean> {
        try {
            const project: ProjectDocument = await this.projectModel.findOne({ _id: new Types.ObjectId(projectId) });
            if(!project) return false;
            
            // Check if the user has access to the project using the current profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type == ProfileType.PERSONAL && project.projectType == ProjectType.TEAM) return false;
            if(selectedProfile.type == ProfileType.SCHOOL && project.schoolId && !project.schoolId.equals(selectedProfile.school)) return false;
            if(selectedProfile.type == ProfileType.SCHOOL && project.projectType == ProjectType.PERSONAL) return false;

            // Check the role of the user in the current project if he is owner or member
            let role = "";  
            if(project.projectOwner.equals(new Types.ObjectId(user.userId))) role = "owner";
            if(project.members.includes(new Types.ObjectId(user.userId))) role = "member";  

            if(role != "owner") return false;

            return true;

        } catch (error) {
            return false;
        }
    }

    async getProjectGeneralInformation(projectId: string, user: accessTokenType): Promise<{projectDetails: ProjectDocument, role: string}> {
        try {
            const project: ProjectDocument = await this.projectModel.findOne({ _id: new Types.ObjectId(projectId) });
            if(!project) throw new BadRequestException("Project not found");
            
            const checkUserAccess = await this.checkUserPermissionToAccessProject(projectId, user);
            if(!checkUserAccess) throw new UnauthorizedException("You're not authorized to access this project");

            const projection = {
                "_id": 1,
                "projectName": 1,
                "projectDescription": 1,
                "projectOwner": 1,
                "projectType": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "invitationCode": 1,
                "members": 1,
            }
            let projectGenralInformation = await this.projectModel.findOne({ _id: new Types.ObjectId(projectId) }).select(projection);

            let role = "";  
            if(projectGenralInformation.projectOwner.equals(new Types.ObjectId(user.userId))) role = "owner";
            if(projectGenralInformation.members.find(member => member._id.equals(new Types.ObjectId(user.userId)))) role = "member";  

            if(role == "") throw new UnauthorizedException("You're not authorized to access this project");
            // Remove members from the project details
            projectGenralInformation = projectGenralInformation.toObject();
            delete projectGenralInformation.members;
            delete projectGenralInformation.projectOwner;

            return {
                projectDetails: projectGenralInformation,
                role
            }
        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async updateProjectGeneralInformation( body: UpdateProjectDto, user: accessTokenType): Promise<{ message: string, projectDetails: ProjectDocument }> {
        try {
            const project: ProjectDocument = await this.projectModel.findOne({ _id: new Types.ObjectId(body.projectId) });
            if(!project) throw new BadRequestException("Project not found");
            
            const checkUserAccess = await this.checkUserPermissionToEditProject(body.projectId, user);
            if(!checkUserAccess) throw new UnauthorizedException("You're not authorized to access this project");

            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the user is the owner of the project
            if(!project.projectOwner.equals(new Types.ObjectId(user.userId))) throw new BadRequestException("You're not authorized to update this project");

            // Check if the user profile type match the project type
            if(project.projectType == ProjectType.PERSONAL && selectedProfile.type == ProfileType.SCHOOL) throw new BadRequestException("You're not authorized to update this project");
            if(project.projectType == ProjectType.TEAM && selectedProfile.type == ProfileType.PERSONAL) throw new BadRequestException("You're not authorized to update this project");

            project.projectName = body.projectName;
            project.projectDescription = body.projectDescription;
            await project.save();

            // Retrun the updated project
            const {projectDetails} = await this.getProjectGeneralInformation(body.projectId, user);

            return { message: "Project updated successfully", projectDetails};
        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }
}
