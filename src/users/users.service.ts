import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Profile, ProfileType, Role, Users, usersDocument } from './schemas/users.schema';
import { Model } from 'mongoose';
import { StudentSignUpDto } from './dto/student_signup.dto';
import * as bcryptjs from 'bcryptjs';
import { TeacherSignUpDto } from './dto/teacher_signup.dto';
import { GlobalSignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { accessTokenType } from 'src/utils/types/access_token.type';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) private readonly usersModel: Model<Users>,
        private readonly jwtService: JwtService
    ) {}


    async checkIfEmailExist(email: string): Promise<boolean> {
        try {
            const isEmailExist = await this.usersModel.exists({email})

            if(isEmailExist) return true
            return false
        } catch (error) {
            throw new BadRequestException()
        }
    }


    async findUserByEmail(email: string): Promise<usersDocument | null> {
        try {
            const user = await this.usersModel.findOne({ email });
            if(user) {
                return user
            }
            return user
        } catch (error) {
            throw new BadRequestException();
        }
    }

    async findUserById(id: string): Promise<usersDocument | null> {
        try {
            const user = await this.usersModel.findById({ id });
            if(user) {
                return user
            }
            return user
        } catch (error) {
            throw new BadRequestException();
        }
    }

    generateInitialProfiles(): Profile[] {
        return [
            { type: ProfileType.PERSONAL, profileName: 'Personal' },
            // { type: ProfileType.SCHOOL, profileName: 'Intellect School' } // Assuming 'intellect' is a valid company ID 
        ];
    }


    async studentSignUp(body: StudentSignUpDto): Promise<Users> {
        try {
            const user = await this.checkIfEmailExist(body.email);
            if(user) throw new UnauthorizedException("This email already exists");

            // Hash the student password with the bcryptjs library
            const hashedPassword = await bcryptjs.hash(body.password, 10);

            // Generate initials profile for the student
            const initialProfiles = this.generateInitialProfiles();

            const studentPayload = {
                email: body.email,
                password: hashedPassword,
                name: body.name,
                profiles: initialProfiles
            }
            const newStudent = new this.usersModel(studentPayload);
            const newCreatedStudent = await newStudent.save()
            

            return newCreatedStudent;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async teacherSignUp(body: TeacherSignUpDto): Promise<Users> {
        try {
            const user = await this.checkIfEmailExist(body.email);
            if(user) throw new HttpException("This email already exists", HttpStatus.OK);

            // Hash the teacher password with the bcryptjs library
            const hashedPassword = await bcryptjs.hash(body.password, 10);

            // Generate initials profile for the teacher
            const initialProfiles = this.generateInitialProfiles();

            const teacherPayload = {
                email: body.email,
                password: hashedPassword,
                name: body.name,
                role: Role.TEACHER,
                profiles: initialProfiles
            }
            const newTeacher = new this.usersModel(teacherPayload);
            const newCreatedTeacher = await newTeacher.save()
            
            if(!newCreatedTeacher) throw new UnauthorizedException();

            return newCreatedTeacher;
        } catch (error) {
            throw error;
        }
    }

    // async adminSignUp(body: TeacherSignUpDto): Promise<Users> {
    //     try {
    //         const user = await this.checkIfEmailExist(body.email);
    //         if(user) throw new HttpException("This email already exists", HttpStatus.OK);

    //         // Hash the teacher password with the bcryptjs library
    //         const hashedPassword = await bcryptjs.hash(body.password, 10);

    //         // Generate initials profile for the teacher
    //         const initialProfiles = this.generateInitialProfiles();

    //         const adminPayload = {
    //             email: body.email,
    //             password: hashedPassword,
    //             name: body.name,
    //             role: Role.ROBOTADMIN,
    //             profiles: initialProfiles
    //         }
    //         const newRobotAdmin = new this.usersModel(adminPayload);
    //         const newCreatedRobotAdmin = await newRobotAdmin.save()
            
    //         if(!newCreatedRobotAdmin) throw new UnauthorizedException();

    //         return newCreatedRobotAdmin;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async SignIn(body: GlobalSignInDto): Promise<{accessToken: string, user: Object}> {
        try {
            const user = await this.findUserByEmail(body.email);
            if(!user) throw new UnauthorizedException("Invalid credentials");

            const isPasswordMatch = await bcryptjs.compare(body.password, user.password);
            if(!isPasswordMatch) throw new UnauthorizedException("Invalid credentials");

            const personalProfile= user.profiles.find(profile => profile.type === ProfileType.PERSONAL) as Profile & { _id: string; };
            if(!personalProfile) throw new UnauthorizedException("Invalid credentials");


            const payload = {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                activeProfileId: personalProfile._id
            }


            const accessToken = this.jwtService.sign(payload, {
                secret: "Intellect-Access-Token-Secret"
            })

            return {
                accessToken,
                user : {
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async GetProfiles(userId: string): Promise<Profile[]>{
        try {
            const user = await this.findUserById(userId);
            if(!user) throw new UnauthorizedException();

            return user.profiles;
        } catch (error) {
            throw new BadRequestException();
        }
    }

    async getBasicUserInformation(user: accessTokenType): Promise<accessTokenType> {
        return user;
    }
}
