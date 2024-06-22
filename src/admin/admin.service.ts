import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException, UseGuards } from '@nestjs/common'
import { schoolDocument } from '../school/schemas/school.schema';
import { usersDocument } from 'src/users/schemas/users.schema';
import { ProjectDocument } from 'src/projects/schemas/project.schema';
import { SchoolService } from 'src/school/school.service';
import { UsersService } from 'src/users/users.service';
import { ProjectsService } from 'src/projects/projects.service';
import { AddSchoolDto } from 'src/school/dto/add_school.dto';
import { ChangeSchoolAdminDto } from 'src/school/dto/change_admin.dto';

@Injectable()
export class AdminService {
    
    // Inject the users services here
    constructor(
        private readonly schoolService: SchoolService,
        private readonly usersService: UsersService,
        private readonly projectsService: ProjectsService
    ) {}
    
    

    async getGeneralInformations(): Promise<{totalSchools: number, totalUsers: number, totalAdmins: number, totalStudents: number, totalTeachers: number, totalProjects: number, totalMetaProjects: number, totalPersonalProjects: number, totalTeamProjects: number, recentSchools: schoolDocument[], recentUsers: usersDocument[], recentProjects: ProjectDocument[], recentMpProjects: ProjectDocument[] }> {
        try {
            /**
             * In this function we will return general basic information for the admin dashboard
             * 1 - Total number of schools
             * 2 - Total number of users
             * 3 - Total number of metaproject
             * 4 - Total number of projects
             * 
             */
            const {totalSchools, recentSchools} = await this.schoolService.getSchoolStatsForSuperAdmin();
            const {totalAdmins, totalStudents, totalTeachers, totalUsers, recentUsers} = await this.usersService.getUsersStatsForSuperAdmin();
            
            const {totalProjects, totalMetaProjects, totalPersonalProjects, totalTeamProjects, recentProjects, recentMpProjects} = await this.projectsService.getProjectStatsForSuperAdmin();
            
            
            return {
                totalSchools,
                totalUsers,
                totalAdmins,
                totalStudents,
                totalTeachers,
                totalProjects,
                totalMetaProjects,
                totalPersonalProjects,
                totalTeamProjects,
                recentSchools,
                recentUsers,
                recentProjects,
                recentMpProjects
            }
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async getAllUsers(): Promise<usersDocument[]> {
        try {
            const users = await this.usersService.getAllUsers();
            return users;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async deleteUser(userId: string): Promise<{message: string}> {
        try {
            const { message } = await this.usersService.deleteUser(userId);
            return {
                message
            }
        } catch (error) {
            if(error instanceof BadRequestException || error instanceof UnauthorizedException) { 
                throw error;
            }
            throw new InternalServerErrorException();
        }
    }

    async addSchool(body: AddSchoolDto): Promise<{message: string, school: schoolDocument, adminSchool: usersDocument}> {
        try {
            const {message, school, adminSchool} = await this.schoolService.addNewSchool(body);
            return {
                message,
                school,
                adminSchool
            };
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async ChangeSchoolAdmin(body: ChangeSchoolAdminDto): Promise<{message: string, newAdmin: usersDocument}> {
        try {
            const { message , newAdmin} = await this.schoolService.changeSchoolAdmin(body);
            return {
                message,
                newAdmin
            }
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
