import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class TeacherRegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(20)
    password: string
}