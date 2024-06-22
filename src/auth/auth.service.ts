import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs'
import { TeacherRegisterDto } from './dto/teacher-register.dto';
import { UsersService } from 'src/users/users.service';
// import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService
    ) {}
}
