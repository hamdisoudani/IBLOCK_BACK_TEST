import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs'
import { TeacherRegisterDto } from './dto/teacher-register.dto';
// import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
//   constructor(
//     //private readonly studentService: StudentService,
//     private readonly teacherService: TeacherService,
//     // private readonly jwtService: JwtService
//     ) {}


  


//   async signUpTeacher(body: TeacherRegisterDto) {
//     const { email, password, ...res } = body;

//         try {
//             //const isStudentExistEmail = await this.studentService.checkEmailExists(email);
//             const isTeacherExistEmail = await this.teacherService.checkTeacherIfEmailExists(email);
//             if(isTeacherExistEmail) {
//                 throw new HttpException("This email already exists", HttpStatus.BAD_REQUEST);
                
//             }

//             const hashedPassword = await bcryptjs.hash(password, 10);

//             body.password = hashedPassword;

//             const user = await this.teacherService.saveTeacher(body);

//             if(!user) throw new HttpException("Service Unavailable", HttpStatus.BAD_REQUEST);

//             return user
//         } catch (error) {
//             throw error;
//         }
//   }



//   async teacherSignIn(body: TeacherLoginDto) : Promise<string> {
//     try {
//         const isTeacher = await this.teacherService.getTeacherByEmail(body.email);
//         if(!isTeacher) throw new UnauthorizedException("Invalid credentials");


//         const isPasswordMatch = await bcryptjs.compare(body.password, isTeacher.password)
//         if(!isPasswordMatch) throw new UnauthorizedException("Invalid credentials");

        
//         // const accessToken = await this.jwtService.signAsync(
//         //     {
//         //         email: isTeacher.email,
//         //         id: isTeacher['sub'],
//         //         role: 'teacher'
//         //     }
//         //     , 
//         //     {
//         //         secret: 'Intellect-Access-Token-Secret'
//         //     }
//         // )

//         return "accessToken";
//     } catch (error) {
//         throw new UnauthorizedException("Invalid credentials");
//     }
//   }
}
