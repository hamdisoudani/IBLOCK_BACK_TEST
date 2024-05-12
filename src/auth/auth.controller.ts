import { Controller, Post, Body, Res, HttpStatus, HttpCode, Get, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  // constructor(
  //   private readonly authService: AuthService,
  //   private readonly studentService: StudentService
  // ) {}


  // @Post('student/register')
  // async signUpStudent(@Body() StudentDto: StudentSignUpDto, @Res() res: Response) {
  //   try {
  //     const user = await this.studentService.signUpStudent(StudentDto);
  //     if(user) {
  //       return res.status(200).json({
  //         'message': "Your accound created successfully."
  //       })
  //     }
  //     return res.status(400).json({
  //       'message': "Bad request"
  //     })
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // @Post('student/login')
  // async loginStudent(@Body() studentLoginDto: StudentLoginDto, @Res() res: Response) {
  //   try {
  //     const {accessToken} = await this.studentService.studentLogin(studentLoginDto);
  //     if(accessToken) {
  //       return res.status(200).json({
  //         accessToken
  //       })
  //     }
  //     return res.status(400).json({
  //       'message': "Bad request"
  //     })
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // // @Post('teacher/register')
  // // async signUpTeacher(@Body() TeacherDto: TeacherRegisterDto) {
  // //   try {
  // //     const user = await this.authService.signUpTeacher(TeacherDto);
  // //     return {
  // //       "teacher": user
  // //     }
  // //   } catch (error) {
  // //     throw error
  // //   }
  // // }



  // // @Post('teacher/login')
  // // @HttpCode(HttpStatus.OK)
  // // async teacherLogin(@Body() teacherLoginDto: TeacherLoginDto) {
  // //   try {
  // //     return await this.authService.teacherSignIn(teacherLoginDto);
  // //   } catch (error) {
  // //     throw error;
  // //   }
  // // }
}
