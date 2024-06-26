import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { StudentSignUpDto } from './dto/student_signup.dto';
import { TeacherSignUpDto } from './dto/teacher_signup.dto';
import { GlobalSignInDto } from './dto/signin.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { Public, Roles } from 'src/utils/decorator/middleware.decorator';
import { Role } from './schemas/users.schema';
import { RoleGuard } from 'src/middleware/role.guard';

@Controller('users')
@UseGuards(RoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  

  @Post('/super_admin/signup')
  @Public()

  async robotAdminSignup(@Body() body: StudentSignUpDto) {
    try {
      
      const robotAdmin = await this.usersService.adminSignUp(body);
      if(!robotAdmin) throw new UnauthorizedException()

      return {
        message: "Your account created successfully",
        user: robotAdmin
      }
    } catch (error) {
      throw error;
    }
  }


  // @Post('/admin/signup')
  // @Public()
  // async adminSignUp(@Body() body: TeacherSignUpDto) {
  //   try {
      
  //     const teacher = await this.usersService.adminSignUp(body);
  //     if(!teacher) throw new UnauthorizedException()

  //     return {
  //       message: "Your account created successfully",
  //       teacher
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  

  @Get('/profile')
  async getUserProfiles(@Req() req : Request) {
    try {
      const user = req.user as accessTokenType;
      return {
        id: user.activeProfileId
      }
      // const profiles = await this.usersService.GetProfiles(user.)
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.SUPER_ADMIN, Role.STUDENT, Role.TEACHER, Role.ROBOTADMIN, Role.SCHOOL_ADMIN)
  @Get('/whoami')
  async whoami(@Req() req: Request) {
    try {
      const user = req.user as accessTokenType;
      const me = await this.usersService.getBasicUserInformation(user);
      return {
        myInformation: me
      }
    } catch (error) {
      throw error;
    }
  }
}
