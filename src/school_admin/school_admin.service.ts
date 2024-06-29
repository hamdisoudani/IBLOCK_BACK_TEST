import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ProjectsService } from 'src/projects/projects.service';
import { SchoolService } from 'src/school/school.service';
import { UsersService } from 'src/users/users.service';
import { profileDocument, Role, usersDocument } from 'src/users/schemas/users.schema';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { schoolDocument } from 'src/school/schemas/school.schema';
import { GetInformationAboutUserDto } from 'src/school/dto/get_information_about_user.dto';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { MetaProjectsService } from 'src/meta_projects/meta_projects.service';
import { MetaProjectDocument } from 'src/meta_projects/schema/meta_project.schema';

@Injectable()
export class SchoolAdminService {
    constructor(
        private readonly usersService: UsersService,
        private readonly schoolService: SchoolService,
        private readonly projectsService: ProjectsService,
        private readonly metaProjectsService: MetaProjectsService
    ) {}

    async checkCurrentUserPermission(user: accessTokenType): Promise<boolean> { 
        try {
            const currentUser = await this.usersService.findUserById(user.userId);
            // Check if user exist
            if(!currentUser) return false;

            // Check user role
            if(currentUser.role !== Role.SCHOOL_ADMIN) return false;
            
            // Check If user already attached to school
            if(!currentUser.schoolID) return false;

            // Check if school exist
            const school = await this.schoolService.findSchoolById(currentUser.schoolID);
            if(!school) return false;

            // check if school id in the user still match the current school id on the user object
            if(user.schoolId !== currentUser.schoolID.toString()) return false;

            // Check if school admin match the current user
            if(school.adminId.toString() !== currentUser._id.toString()) return false;
            return true;
        } catch (error) {
            if(error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Internal Server Error');
        }
    }
    async getAllJoinedUsers(user: accessTokenType): Promise<schoolDocument> {
        try {
            const access = await this.checkCurrentUserPermission(user);
            if(!access) throw new UnauthorizedException('You are not authorized to access this route');
            const users = await this.schoolService.getAllJoinedStudent(user.schoolId);
            return users;
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error
            }
            throw new InternalServerErrorException('Internal Server Error');
        }
    }

    async getSchoolStats(user: accessTokenType): Promise< {schoolName: string, totalMembers: number, studentsCount: number, teachersCount: number, projectsCount: number, metaProjectsCount: number, projectsDetails: any[], metaProjectsDetails: any[], last5Users: usersDocument[] } > {
        try {
            const access = await this.checkCurrentUserPermission(user);
            if(!access) throw new UnauthorizedException('You are not authorized to access this route');
            const details = await this.schoolService.getStatsForCurrentSchool(user.schoolId);
            return details;
        } catch (error) {
            throw error;
        }
    }

    async getUserStats(userToken: accessTokenType, body: GetInformationAboutUserDto): Promise<{userInfromation: usersDocument, getUserProjects: ProjectDocument[], createdMetaProjects: MetaProjectDocument[]}> {
        try {
            const access = await this.checkCurrentUserPermission(userToken);
            if(!access) throw new UnauthorizedException('You are not authorized to access this route');
            const informations = await this.schoolService.getInformationAboutUser(userToken, body);
            const { metaProjects } = await this.metaProjectsService.getMetaProjectsForSpecificTeacher(body.userID);
            return {
                userInfromation: informations.userInformation,
                getUserProjects: informations.getUserProjects,
                createdMetaProjects: metaProjects
            }
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error
            }
            throw new InternalServerErrorException('Internal Server Error');
        }
    }
}
