import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MetaProject, MetaProjectDocument } from './schema/meta_project.schema';
import { Model, Types } from 'mongoose';
import { ProfileService } from 'src/profile/profile.service';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { Role } from 'src/users/schemas/users.schema';
import { CreateMetaProjectDto } from './dto/create_meta_project.dto';
import { customAlphabet } from 'nanoid';
import { CUSTOM_INVITATION_CODE_ALPHABET } from 'src/utils/constant/security.constant';
import { MetaProjectCodes, MetaProjectCodesDocument } from './schema/meta_project_codes.schema';
import { AddNewCodeToMpDto } from './dto/add_new_code_to_mp.dto';
import { JoinCollaborativeMpDto } from './dto/join_collaborative_mp.dto';
import { ProjectsService } from 'src/projects/projects.service';
import { Project, ProjectDocument } from 'src/projects/schemas/project.schema';
import { getAllInformationsForMpPipeline, getGeneralInformationsForMpPipeline } from './pipelines/get_informations_for_mp.pipeline';
import { JoinCollaborativeMpChildProjectDto } from './dto/join_collaborative_mp_child_project.dto';
import { getAllJoinedMetaProjectsByStudent, getAllOwndedMetaProjectsByTeacher } from './pipelines/get_all_mp.pipeline';
import { GetAllChildProjectUnderMpDto } from './dto/get_all_child_project_under_mp.dto';

@Injectable()
export class MetaProjectsService {
    constructor(
        @InjectModel(MetaProject.name) private metaProjectModel: Model<MetaProject>,
        @InjectModel(MetaProjectCodes.name) private metaProjectCodesModel: Model<MetaProjectCodes>,
        private readonly profileService: ProfileService,
        private readonly projectService: ProjectsService
    ) {}

    /**
     * 
     * @param projectId // The id of the meta project
     * @param user // The user making the request
     * @returns boolean // true if the user has permission to edit the project, false otherwise
     */
    async checkPermissionToEditProject(projectId: string, user: accessTokenType): Promise<boolean> {
        try {
            // Check if the user is a teacher
            if(user.role !== Role.TEACHER) return false;

            // check if the project exists
            const project = await this.metaProjectModel.findById(projectId);
            if(!project) return false;

            // check if the project was created by the user
            if(!project.createdBy.equals(new Types.ObjectId(user.userId))) return false;

            return true;
        } catch (error) {
            throw error;
        }
    }

    async getMetaProjectBasedOnProvidedName(projectName: string, userId: string): Promise<boolean> {
        const isProjectWithProvidedNameFound =  await this.metaProjectModel.exists({ projectName, createdBy: new Types.ObjectId(userId) });
        if(isProjectWithProvidedNameFound) return true;
        return false;
    }

    async getAllMetaProjectsForTeacher(user: accessTokenType): Promise<MetaProject[]> {
        try {
            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the user is a teacher
            if (user.role !== Role.TEACHER) throw new UnauthorizedException('You are not authorized to view projects');

            // check if the selected profile is a school profile
            if (selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to view projects');

            const projects = await this.metaProjectModel.find({ createdBy: new Types.ObjectId(user.userId) });
            return projects;
        } catch (error) {
            if(error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException('An error occurred while fetching the projects');
        }
    }

    private generateInvitationCode(): string {
        const nanoid = customAlphabet(CUSTOM_INVITATION_CODE_ALPHABET, 8);
        return nanoid();
    }

    private async createMetaProjectCode(body: AddNewCodeToMpDto, metaProject: MetaProjectDocument): Promise<MetaProjectCodesDocument> {
        try {

            // Check if there is no project with the same name
            const projectFound = await this.metaProjectCodesModel.exists({ childProjectName: body.childProjectName, metaProjectID: metaProject._id });
            if(projectFound) throw new BadRequestException('A project with this name already exists');

            let code = this.generateInvitationCode();
            // check if the code already exists
            let codeExists = await this.metaProjectCodesModel.exists({ code });
            
            // if the code already exists, then generate a new code
            while(codeExists) {
                code = this.generateInvitationCode();
                codeExists = await this.metaProjectCodesModel.exists({ code });
            }

            const newCode = new this.metaProjectCodesModel({ 
                code,
                childProjectName: body.childProjectName,
                childProjectDescription: body.childProjectDescription || "",
                metaProjectID: new Types.ObjectId(body.projectId),
             });
            await newCode.save();
            return newCode;
        } catch (error) {
            throw error;
        }
    }

    private async createMetaProjectInvitationCode(): Promise<string> {
        try {
            let code = this.generateInvitationCode();
            // check if the code already exists
            let codeExists = await this.metaProjectModel.exists({ invitationCode: code});
            
            // if the code already exists, then generate a new code
            while(codeExists) {
                code = this.generateInvitationCode();
                codeExists = await this.metaProjectModel.exists({ invitationCode: code});
            }

            return code;
        } catch (error) {
            throw error;
        }
    }

    async createMetaProject(body: CreateMetaProjectDto, user: accessTokenType): Promise<{message: string, metaProject: MetaProjectDocument}> {
        try {
            const { selectedProfile } = await this.profileService.getUserProfiles(user);

            // Check if the user is a teacher
            if (user.role !== Role.TEACHER) throw new UnauthorizedException('You are not authorized to create a project');

            // check if the selected profile is a school profile
            if (selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to create a project');

            // check if the project name already exists
            const projectFound = await this.getMetaProjectBasedOnProvidedName(body.projectName, user.userId);
            if(projectFound) throw new BadRequestException('A project with this name already exists');

            // check if the teacher has reached the maximum number of projects
            const projects = await this.getAllMetaProjectsForTeacher(user);
            if(projects.length >= 5) throw new BadRequestException('You have reached the maximum number of projects you can create');


            
            const invitationCode = await this.createMetaProjectInvitationCode();
            // create the project
            const newProject = new this.metaProjectModel({
                projectName: body.projectName,
                projectDescription: body.projectDescription || "",
                collaborative: body.collaborative,
                createdBy: new Types.ObjectId(user.userId),
                invitationCode,
                schoolId: selectedProfile.school
            });
            // if the project is collaborative, then add a new collaborative code
            // if(body.collaborative) {
            //     const code = await this.createMetaProjectCode();
            //     newProject.projectCodes.push(code._id);
            // }
            await newProject.save();
            const pipeline = [
                {
                    $match: {
                        _id: newProject._id
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'members',
                        foreignField: '_id',
                        as: 'members',
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1,
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
                        projectDescription: 1,
                        members: 1,
                        numberOfCollaborativeInvitationCodes: { $cond: { if: { $isArray: "$projectCodes" }, then: { $size: "$projectCodes" }, else: "0"} },
                        collaborative: { $cond: { if: { $eq: ["$collaborative", true] }, then: "Yes", else: "No"} },
                        invitationCode: 1,
                        createdAt: 1
                    }
                }
            ]
            const projectData = await this.metaProjectModel.aggregate(pipeline);
            return { message: 'Project created successfully', metaProject: projectData[0] };
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while creating the project');
        }
        
    }

    // This function used when the teacher want to add a new collaborative code to the meta project
    async addNewCollaborativeCodeToMetaProject(body: AddNewCodeToMpDto, user: accessTokenType): Promise<{message: string, code: MetaProjectCodesDocument}> {
        try {
            // check if user has access to this project
            const hasAccess = await this.checkPermissionToEditProject(body.projectId, user);  
            if(!hasAccess) throw new UnauthorizedException('You do not have permission to edit this project');

            // check if the current project is collaborative
            const project = await this.metaProjectModel.findById(body.projectId);
            if(!project.collaborative) throw new BadRequestException('This project is not collaborative');

            // check if the project has reached the maximum number of codes
            if(project.projectCodes.length >= 5) throw new BadRequestException('This project has reached the maximum number of codes');

            // create the code
            const code = await this.createMetaProjectCode(body, project);
            project.projectCodes.push(code._id);
            await project.save();
            return { message: 'Code created successfully', code };
        } catch (error) {
            throw error;
        }
    }

    
    // This function will handle the joining of a non-collaborative project by creating a new project under the meta project for each invited student
    // The student will be able to join the project by providing the invitation code received from the teacher

    private async joinNonCollaborativeMetaProject(user: accessTokenType, metaProject: MetaProjectDocument): Promise<{message: string, createdProject: Project}> {
        try {
            // check if the student has already joined the project
            const createProjectPayload = {
                name: `${metaProject.projectName} - ${user.name}`,
                description: ""
            }
            const project = await this.projectService.createNonCollaborativeProjectUnderMetaProject(createProjectPayload, user, metaProject);

            // add the student to the meta project as a member after creating the project
            if(!metaProject.members.includes(new Types.ObjectId(user.userId))) {
                metaProject.members.push(new Types.ObjectId(user.userId));
                await metaProject.save();
            } else {
                throw new BadRequestException('You have already joined this meta project, if you have not joined the project and you think it\'s an error please contact our support team.');
            }

            return { message: 'Project created successfully', createdProject: project };
        } catch (error) {
            throw error;
        }
    }

    private async joinCollaborativeMetaProject(user: accessTokenType, metaProject: MetaProjectDocument): Promise<{message: string}> {
        try {
           
            // check if the student has already joined the project
            if(metaProject.members.includes(new Types.ObjectId(user.userId))) throw new BadRequestException('You have already joined this project.');

            // add the student to the project as a member
            metaProject.members.push(new Types.ObjectId(user.userId));
            await metaProject.save();
            return { message: 'You have successfully joined the project please contact your teacher to get your project invitation code' };
        } catch (error) {
            throw error;
        }
    }

    async joinProjectUnderMetaProject(body: JoinCollaborativeMpDto, user: accessTokenType): Promise<{message: string, createdProject?: Project}> {
        try {
            // check if the student profile is a school profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to join this project using your current profile');


            //  check if the invitation code belongs to a non collaborative meta project
            const metaProject = await this.metaProjectModel.findOne({ invitationCode: body.invitationCode });
           if(metaProject) {
            // If the metaproject is not collaborative
            if(!metaProject.collaborative) {
                // check if the user is a student
                if(user.role !== Role.STUDENT) throw new UnauthorizedException('Only students can join this project');

                return await this.joinNonCollaborativeMetaProject(user, metaProject);
            } else {
                throw new BadRequestException('This project is collaborative, you cannot join it using this code');
            }

           }
            
        //    check if the invitation code belongs to a collaborative meta project from the table meta_project_codes
        const code = await this.metaProjectCodesModel.findOne({ code: body.invitationCode });
        if(!code) throw new BadRequestException('The invitation code does not exist');

        // check if the meta project exists
        const metaProjectFromCollaborativeCode = await this.metaProjectModel.findById(new Types.ObjectId(code.metaProjectID));
        if(!metaProjectFromCollaborativeCode) throw new BadRequestException('The project does not exist');

        // Join the project if no problem
        const response = await this.joinCollaborativeMetaProjectChildProject({invitationCode: body.invitationCode}, user);
        
        // add the student to the meta project as a member after joining the project
        if(!metaProjectFromCollaborativeCode.members.includes(new Types.ObjectId(user.userId))) {
            metaProjectFromCollaborativeCode.members.push(new Types.ObjectId(user.userId));
            await metaProjectFromCollaborativeCode.save();
        }
        return response;
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while joining the project');
        }
    }

    async getMetaProjectDetails(projectId: string, user: accessTokenType): Promise<{viewAs: 'student' | 'owner', metaProjectDetails: MetaProjectDocument, joinedProjects?: ProjectDocument[]}> {
        try {
            let viewAs: 'student' | 'owner';

            // check if the metaproject exists
            const projectExists = await this.metaProjectModel.exists({ _id: projectId });
            if(!projectExists) throw new BadRequestException('The project does not exist');

            // check user profile type if it's a school profile and if matches the project school profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to view this project with your current profile');
            
            const metaProject = await this.metaProjectModel.findById(new Types.ObjectId(projectId));
            if(!metaProject.schoolId.equals(selectedProfile.school)) throw new UnauthorizedException('You are not authorized to view this project with your current profile');

            // check if the user has access to the project
            const hasAccess = await this.checkPermissionToEditProject(projectId, user);
            

            // check if he don't have access to modify the project && he is not a member of the project
            if(!hasAccess && !metaProject.members.includes(new Types.ObjectId(user.userId))) throw new UnauthorizedException('You do not have permission to view this project');

            // if he still don't have access to modify the project but he is a member of the project => it's a student so we will return the project details (General informations)
            if(!hasAccess) {
                /*viewAs = 'student';
                const metaProjectDetails = await this.metaProjectModel.aggregate(getGeneralInformationsForMpPipeline(projectId));
                const getJoinedProjectUnderThisMetaProject = await this.projectService.getAllProjectsUnderMetaProject(projectId, user);
                return { viewAs, metaProjectDetails: metaProjectDetails[0], joinedProjects: getJoinedProjectUnderThisMetaProject};*/
                
                // Updated : 2024-05-24 only teacher can see this project Information
                throw new UnauthorizedException('You are not authorized to view this project');
            }
            
            viewAs = 'owner';
            // get the project details
            const metaProjectDetails = await this.metaProjectModel.aggregate(getAllInformationsForMpPipeline(projectId));
            return { viewAs, metaProjectDetails: metaProjectDetails[0]};
        } catch (error) {
            throw error;
        }
    }

    /*async joinCollaborativeMetaProjectChildProjectWithInvitationCode(body:JoinCollaborativeMpChildProjectDto, user: accessTokenType): Promise<{message: string, project: ProjectDocument}> {
        try {
            // check if the student profile is a school profile and matches the project school profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to join this project using your current profile');

            // check if the project exists by the invitation code in the meta project codes array
            const code = await this.metaProjectCodesModel.findOne({ code: body.invitationCode });
            if(!code) throw new BadRequestException('The invitation code does not exist');

            // check if the meta project exists
            const metaProject = await this.metaProjectModel.findById(new Types.ObjectId(body.metaProjectID));
            if(!metaProject) throw new BadRequestException('The meta project does not exist');

            // make sure the school profile is the same as the project school profile
            if(!metaProject.schoolId.equals(selectedProfile.school)) throw new UnauthorizedException('You are not authorized to join this project using your current profile');

            // check if the invitation code is in the meta project codes array
            if(!metaProject.projectCodes.includes(code._id)) throw new BadRequestException('The invitation code does not exist');


            // check if the user is a student
            if(user.role !== Role.STUDENT) throw new UnauthorizedException('Only students can join this project');

            // check if the number of members in the code is less than the maximum number of users
            if(code.members.length >= code.maxUsers) throw new BadRequestException('The maximum number of users has been reached please ask your teacher to generate a new code');

            // check if the student is a member of the meta project (this is to prevent student to use codes from other projects)
            if(!metaProject.members.includes(new Types.ObjectId(user.userId))) throw new BadRequestException('You are not authorized to perform this action, you need to join the meta project first in order to join this project');

            // use the ProjectService to create a new project under the meta project
            const {message, project} = await this.projectService.createCollaborativeProjectUnderMetaProject(user, metaProject, code)

            code.members.push(new Types.ObjectId(user.userId));
            await code.save();

            return { message, project };
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while joining the project');
        }
    }*/

    async getAllMetaProjectsRelatedToCurrentUserSchoolProfile(user: accessTokenType): Promise<{joinedMetaProjects?: MetaProject[], ownedMetaProjects?: MetaProject[]}> {
        try {
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            // check if the selected profile is a school profile
            if(selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to view projects');

            if(user.role === Role.TEACHER) {
                //const ownedMetaProjects = await this.metaProjectModel.find({ createdBy: new Types.ObjectId(user.userId), schoolId: selectedProfile.school });
                const ownedMetaProjects = await this.metaProjectModel.aggregate(getAllOwndedMetaProjectsByTeacher(user.userId, selectedProfile.school));
                return { ownedMetaProjects };
            }
            
            const joinedMetaProjects = await this.metaProjectModel.aggregate(getAllJoinedMetaProjectsByStudent(user.userId, selectedProfile.school));
            return { joinedMetaProjects };
        } catch (error) {
            throw error;
        }
    }


    /**
     * This function will be used in case a student wants to join a project under a meta project
     * The student will provide the invitation code (collaborative codes) received from the teacher
     * 1st case => The student is already a member of the meta project means he already joined a project then forbid him from joining the new project
     * 2nd case => The student is not a member of the meta project, then create a new project under the meta project and add the student to the project
     */
    private async joinCollaborativeMetaProjectChildProject(body: JoinCollaborativeMpChildProjectDto, user: accessTokenType): Promise<{message: string, project?: ProjectDocument}> {
        try {
            // check if the student profile is a school profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to join this project using your current profile');

            // Check first if the collaborative invitation code exists
            const code = await this.metaProjectCodesModel.findOne({ code: body.invitationCode });
            if(!code) throw new BadRequestException('The invitation code does not exist');

            // check if the meta project exists using the metaproject id on the collaborative code
            const metaProject = await this.metaProjectModel.findById(new Types.ObjectId(code.metaProjectID));
            if(!metaProject) throw new BadRequestException('This invitation code is not valid or the project does not exist');

            // check if the school profile is the same as the project school profile
            if(!metaProject.schoolId.equals(selectedProfile.school)) throw new UnauthorizedException('You are not authorized to join this project using your current profile');

            // check if the student is a member of the meta project means he already joined a project under the meta project
            if(metaProject.members.includes(new Types.ObjectId(user.userId))) throw new BadRequestException('You cannot join this project because you have already joined a project under this meta project. If you think it\'s an error please contact our support team.');

            // check if the user is a student
            if(user.role !== Role.STUDENT) throw new UnauthorizedException('Only students can join this project');


            // check if the number of members in the code is less than the maximum number of users
            if(code.members.length >= code.maxUsers) throw new BadRequestException('The maximum number of users has been reached please ask your teacher to generate a new code');

            // use the ProjectService to create a new project under the meta project
            const {message, project} = await this.projectService.createCollaborativeProjectUnderMetaProject(user, metaProject, code)

            code.members.push(new Types.ObjectId(user.userId));
            metaProject.members.push(new Types.ObjectId(user.userId));
            await code.save();

            return { message, project };
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('An error occurred while joining the project');
        }
    }

    async getAllJoinedChildProjectsForStudent(user: accessTokenType): Promise<ProjectDocument[]> {
        try {
            // check if the student profile is a school profile
            const { selectedProfile } = await this.profileService.getUserProfiles(user);
            if(selectedProfile.type !== 'school') throw new UnauthorizedException('You are not authorized to view this project using your current profile');

            // get all the projects under the meta projects
            const projects = await this.projectService.getAllJoinedChildMetaProjectsUnderSchool(user);
            return projects;
        } catch (error) {
            throw error;
        }
    }

    async deleteMetaProject(projectId: string, user: accessTokenType): Promise<{message: string}> {
        try {
            // check if the user has permission to delete the project
            const hasAccess = await this.checkPermissionToEditProject(projectId, user);
            if(!hasAccess) throw new UnauthorizedException('You do not have permission to delete this project');

            // check if the project exists
            const project = await this.metaProjectModel.findById(projectId);
            if(!project) throw new BadRequestException('The project does not exist');

            // Delete any project that is under the meta project    
            await this.projectService.deleteAllProjectsUnderMetaProject(projectId);

            // Delete any collaborative codes that are under the meta project
            await this.metaProjectCodesModel.deleteMany({ metaProjectID: new Types.ObjectId(projectId) });

            // delete the project
            await project.delete();
            return { message: 'Project deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async deleteCollaborativeCode(codeId: string, user: accessTokenType): Promise<{message: string}> {
        try {
            // check if the user has permission to delete the code
            const code = await this.metaProjectCodesModel.findById(codeId);
            if(!code) throw new BadRequestException('The code does not exist');

            // check if the user has permission to delete the code
            const metaProject = await this.metaProjectModel.findById(code.metaProjectID);
            if(!metaProject) throw new BadRequestException('The project does not exist');

            const hasAccess = await this.checkPermissionToEditProject(metaProject._id.toString(), user);
            if(!hasAccess) throw new UnauthorizedException('You do not have permission to delete this code');

            // check if the user is the owner of that meta project
            if(!metaProject.createdBy.equals(new Types.ObjectId(user.userId))) throw new UnauthorizedException('You do not have permission to delete this code');

            // Delete every project that is under this collaborative code
            await this.projectService.deleteAllProjectsUnderCollaborativeCode(code.code);
            // delete the code
            await code.delete();
            return { message: 'Code deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    async getAllProjectsListedUnderMetaProject(body:GetAllChildProjectUnderMpDto ,user: accessTokenType): Promise<{projects: ProjectDocument[]}> {
        try {
            // Check if meta project exists
            const metaProject = await this.metaProjectModel.findOne({ _id: new Types.ObjectId(body.metaProjectID), createdBy: new Types.ObjectId(user.userId) });
            if(!metaProject) throw new BadRequestException('The project does not exist');

            // check if the current user is the owner of the meta project
            const projects = await this.projectService.getAllProjectsUnderMetaProjectForTeacher(body.metaProjectID);
            return { projects };
        } catch(e) {
            if(e instanceof BadRequestException || e instanceof UnauthorizedException) throw e;
            throw new InternalServerErrorException('An error occurred while fetching the projects');
        }
    }

    async getMetaProjectsForSpecificTeacher(teacherId: string): Promise<{metaProjects: MetaProjectDocument[]}> {
        try {
            const metaProjects = await this.metaProjectModel.find({ createdBy: new Types.ObjectId(teacherId) }).select('projectName projectDescription collaborative invitationCode members createdAt');
            return { metaProjects };
        } catch (error) {
            throw error;
        }
    }
}
