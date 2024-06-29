import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MetaProjectsService } from './meta_projects.service';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from 'src/users/schemas/users.schema';
import { CreateMetaProjectDto } from './dto/create_meta_project.dto';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { JoinCollaborativeMpDto } from './dto/join_collaborative_mp.dto';
import { GetMpInformationsDto } from './dto/get_mp_informations.dto';
import { JoinCollaborativeMpChildProjectDto } from './dto/join_collaborative_mp_child_project.dto';
import { AddNewCodeToMpDto } from './dto/add_new_code_to_mp.dto';
import { RoleGuard } from 'src/middleware/role.guard';
import { GetAllChildProjectUnderMpDto } from './dto/get_all_child_project_under_mp.dto';

// mp => meta project
@UseGuards(RoleGuard)
@Controller('mp')
export class MetaProjectsController {
  constructor(private readonly metaProjectsService: MetaProjectsService) {}

  @Roles(Role.TEACHER)
  @Post()
  async createMetaProject(@Body() body: CreateMetaProjectDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const {message, metaProject} = await this.metaProjectsService.createMetaProject(body, user);

      return {message, metaProject};
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.TEACHER, Role.STUDENT)
  @Get()
  async getMetaProjects(@Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const metaProjects = await this.metaProjectsService.getAllMetaProjectsRelatedToCurrentUserSchoolProfile(user);

      return metaProjects;
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.STUDENT)
  @Get('joined-projects')
  async getJoinedProjects(@Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const response = await this.metaProjectsService.getAllJoinedChildProjectsForStudent(user);
      return response;
    } catch (error) {
      throw error
    }
  }

  @Roles(Role.STUDENT)
  @Post('join/')
  async joinMetaProject(@Body() body: JoinCollaborativeMpDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const response= await this.metaProjectsService.joinProjectUnderMetaProject(body, user);

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.TEACHER) // updated: remove Role.STUDENT
  @Get(':metaProjectID')
  async getMetaProject(@Param() params: GetMpInformationsDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const metaProject = await this.metaProjectsService.getMetaProjectDetails(params.metaProjectID, user);

      return metaProject;
    } catch (error) {
      throw error;
    }
  }
  
  @Roles(Role.TEACHER)
  @Delete(':metaProjectID')
  async deleteMetaProject(@Param() params: GetMpInformationsDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const response = await this.metaProjectsService.deleteMetaProject(params.metaProjectID, user);

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.TEACHER)
  @Delete('/collaborative-code/:code')
  async deleteCollaborativeCode(@Param('code') code: string, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const response = await this.metaProjectsService.deleteCollaborativeCode(code, user);

      return response;
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.TEACHER)
  @Get(':metaProjectID/child-projects')
  async getChildProjects(@Param() params: GetAllChildProjectUnderMpDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const response = await this.metaProjectsService.getAllProjectsListedUnderMetaProject(params, user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Replaced in the join function to avoid code duplication
  /*@Roles(Role.STUDENT)
  @Post('join/child-project')
  async joinCollaborativeMpChildProject(@Body() body: JoinCollaborativeMpChildProjectDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      //const response = await this.metaProjectsService.joinCollaborativeMetaProjectChildProjectWithInvitationCode(body, user);
      const response = await this.metaProjectsService.joinCollaborativeMetaProjectChildProject(body, user);
      return response;
    } catch (error) {
      throw error;
    }
  }*/

  @Roles(Role.TEACHER)
  @Post('add-collaborative-code')
  async addCollaborativeCode(@Body() body: AddNewCodeToMpDto, @Req() request: Request) {
    try {
      const user = request.user as accessTokenType;
      const response = await this.metaProjectsService.addNewCollaborativeCodeToMetaProject(body, user);

      return response;
    } catch (error) {
      throw error;
    }
  }

  
}
