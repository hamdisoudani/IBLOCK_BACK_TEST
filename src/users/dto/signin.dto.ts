import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class GlobalSignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string
}