import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create_project.dto';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { RoleGuard } from 'src/middleware/role.guard';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from 'src/users/schemas/users.schema';
import { JoinProjectDto } from './dto/join_project.dto';
import { LeaveProjectDto } from './dto/leave_project.dto';
import { RemoveProjectDto } from './dto/remove_project.dto';
import { StoreUserWorkDto } from './dto/store_user_work.dto';
import { GetProjectDetailsDto } from './dto/get_project_details.dto';
import { UpdateProjectDto } from './dto/update_project.dto';

@UseGuards(RoleGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Roles(Role.STUDENT, Role.TEACHER)
  @Post('add')
  async createProject(@Body() body: CreateProjectDto, @Req() request: Request) { 
    try {
      const user = request.user as accessTokenType;
      const project = await this.projectsService.createProject(body, user);

      return {
        "message": "Your new project created successfully",
        "projectDetails": project
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinProject(@Body() body: JoinProjectDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const project = await this.projectsService.joinProject(body.invitationCode, user);

      return {
        "message": "You've joined the project successfully",
        "projectDetails": project
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Post('leave')
  @HttpCode(HttpStatus.OK)
  async leaveProject(@Body() body: LeaveProjectDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {message} = await this.projectsService.leaveProject(body.projectId, user);

      return {
        message
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCurrentProfileProjects(@Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const { ownedProjects, joinedProjects } = await this.projectsService.getAllProjectsForTheCurrentProfile(user);

      return {
        ownedProjects,
        joinedProjects
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Post('remove')
  @HttpCode(HttpStatus.OK)
  async removeProject(@Body() body:  RemoveProjectDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {message} = await this.projectsService.removeUserProject(body.projectId, user);

      return {
        message
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Post('save')
  async saveUserWorkData(@Req() request: Request, @Body() body: StoreUserWorkDto) {
    try {
      const user = request.user as accessTokenType;
      const {message} = await this.projectsService.storeUserWorkData(body, user);

      return {
        message
      }
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Get('/:projectId')
  async getProjectDetails(@Param() params: GetProjectDetailsDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {projectDetails, workHistory, role} = await this.projectsService.getProjectInformation(params.projectId, user);

      return {
        projectDetails, 
        workHistory, 
        role
      };
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Get('/:projectId/general')
  async getProjectGeneralDetails(@Param() params: GetProjectDetailsDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {projectDetails, role} = await this.projectsService.getProjectGeneralInformation(params.projectId, user);

      return {
        projectDetails,
        role
      };
    } catch (error) {
      throw error;
    }
  }
  @Roles(Role.STUDENT, Role.TEACHER)
  @Post('/:projectId/general/update')
  async updateProjectInformation(@Body() body: UpdateProjectDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {message, projectDetails} = await this.projectsService.updateProjectGeneralInformation(body, user);

      return {
        message,
        projectDetails
      };
    } catch (error) {
      throw error;
    }
  }
}
