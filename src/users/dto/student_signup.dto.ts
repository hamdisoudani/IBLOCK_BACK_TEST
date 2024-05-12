import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class StudentSignUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    password: string
}