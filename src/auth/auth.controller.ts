import { Controller, Post, Body, Res, HttpStatus, HttpCode, Get, UseFilters, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Public } from 'src/utils/decorator/middleware.decorator';
import { UsersService } from 'src/users/users.service';
import { StudentSignUpDto } from 'src/users/dto/student_signup.dto';
import { TeacherSignUpDto } from 'src/users/dto/teacher_signup.dto';
import { GlobalSignInDto } from 'src/users/dto/signin.dto';
import { RoleGuard } from 'src/middleware/role.guard';

@Controller('auth')
@UseGuards(RoleGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}


  @Post('/teacher/signup')
  @Public()
  async teacherSignUp(@Body() body: TeacherSignUpDto) {
    try {
      
      const teacher = await this.usersService.teacherSignUp(body);
      if(!teacher) throw new UnauthorizedException()

      return {
        message: "Your account created successfully",
        teacher
      }
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('/student/signup')
  async studentSignUp(@Body() body: StudentSignUpDto) {
    try {
      
      const student = await this.usersService.studentSignUp(body);
      if(!student) throw new UnauthorizedException()

      return {
        message: "Your account created successfully",
        student
      }
    } catch (error) {
      throw error;
    }
  }

  @Post('/signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async SignIn(@Body() body: GlobalSignInDto) {
    try {
      
      const {accessToken, user} = await this.usersService.SignIn(body);
      if(!accessToken) throw new UnauthorizedException("Invalid credentials");

      return {
        message: "You've successully logged in",
        accessToken,
        user
      }
    } catch (error) {
      throw error;
    }
  }
}
