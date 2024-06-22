import { SchoolService } from 'src/school/school.service';
import { ProjectsService } from 'src/projects/projects.service';
import { BadRequestException, forwardRef, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Profile, ProfileType, Role, Users, usersDocument } from './schemas/users.schema';
import { Model, Types } from 'mongoose';
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
        private readonly jwtService: JwtService,
        private readonly ProjectsService: ProjectsService,
        private readonly SchoolService: SchoolService
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
            const user = await this.usersModel.findOne({ _id: new Types.ObjectId(id)});
            return user
        } catch (error) {
            throw new BadRequestException();
        }
    }

    private generateInitialProfiles(): Profile[] {
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

    async adminSignUp(body: TeacherSignUpDto): Promise<Users> {
        try {
            const user = await this.checkIfEmailExist(body.email);
            if(user) throw new HttpException("This email already exists", HttpStatus.OK);

            // Hash the teacher password with the bcryptjs library
            const hashedPassword = await bcryptjs.hash(body.password, 10);

            // Generate initials profile for the teacher
            const initialProfiles = this.generateInitialProfiles();

            const adminPayload = {
                email: body.email,
                password: hashedPassword,
                name: body.name,
                role: Role.SUPER_ADMIN,
                profiles: initialProfiles
            }
            const newRobotAdmin = new this.usersModel(adminPayload);
            const newCreatedRobotAdmin = await newRobotAdmin.save()
            
            if(!newCreatedRobotAdmin) throw new UnauthorizedException();

            return newCreatedRobotAdmin;
        } catch (error) {
            throw error;
        }
    }

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
                activeProfileId: personalProfile._id,
               
            }
            
            // Check if the schoolID exist then add it to payload
            if(user.schoolID) {
                payload['schoolId'] = user.schoolID;
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

    async createNewUser(body: { email: string, password: string, role: Role, name: string }): Promise<usersDocument> {
        try {
            
            // Check if there's a user with this email
            const user = await this.findUserByEmail(body.email);
            if(user) throw new BadRequestException("There is already a user with this email");

            // Hash the password
            const hashedPassword = await bcryptjs.hash(body.password, 10);

            // Create the new user
            const initialProfiles = this.generateInitialProfiles();
            const newUser = new this.usersModel({
                name: body.name,
                email: body.email,
                password: hashedPassword,
                role: body.role,
                profiles: initialProfiles
            });
            const newCreatedUser = await newUser.save();
            if(!newCreatedUser) throw new BadRequestException("Something went wrong");

            return newCreatedUser;
        } catch (error) {
            if(error instanceof HttpException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async getUsersStatsForSuperAdmin(): Promise<{totalUsers: number, totalTeachers: number, totalStudents: number, totalAdmins: number, recentUsers: usersDocument[]}> {
        try {
            const totalUsers = await this.usersModel.countDocuments();
            const totalTeachers = await this.usersModel.countDocuments({role: Role.TEACHER});
            const totalStudents = await this.usersModel.countDocuments({role: Role.STUDENT});
            const totalAdmins = await this.usersModel.countDocuments({role: Role.SUPER_ADMIN});
            const recentUsers = await this.usersModel.find().select('email name role').sort({createdAt: -1}).limit(5);

            return {
                totalUsers,
                totalTeachers,
                totalStudents,
                totalAdmins,
                recentUsers
            }
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async getAllUsers(): Promise<usersDocument[]> {
        try {
            const users = (await this.usersModel.find().select('email name role'));
            return users;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async deleteUser(userId: string): Promise<{message: string}> {
        try {
            const user = await this.usersModel.findOne({_id: new Types.ObjectId(userId) });
            if(!user) throw new BadRequestException("User not found");

            // Get all projects for the current user
            const {joinedProjects, ownedProjects} = await this.ProjectsService.getAllProjectsByUserID(userId);   

            // Delete all projects
            ownedProjects.forEach(async project => {
                // Delete also the project work history
                await this.ProjectsService.deleteProject(project._id.toString());
            });

            // Unjoin the user from all joined projects
            joinedProjects.forEach(async project => {
                project.members = project.members.filter(member => member.toString() !== userId);
                await project.save();
            });

            // Unjoin joined schools
            const schools = await this.SchoolService.getAllSchoolsJoinedByUser(userId);
            schools.forEach(async school => {
                school.members = school.members.filter(member => member.toString() !== userId);
                await school.save();
            });

            // Delete the user from the database
            await user.deleteOne();

            return {
                message: "User deleted successfully"
            }
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async getUserInformation(userId: string): Promise<usersDocument> {
        try {
            const user = await this.usersModel.findOne({_id: new Types.ObjectId(userId)}).select('email name role createdAt');
            if(!user) throw new BadRequestException("User not found");

            return user;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }
}
