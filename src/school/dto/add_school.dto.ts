import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AddSchoolDto {

    @IsString({ message: "The school name contains unsupported characters"})
    @IsNotEmpty({ message: "The school name can't be empty" })
    @MinLength(4, {message: "the school name must be at least 4 characters length"})
    @MaxLength(30, {message: "The school name can't be more than 30 characters length"})
    schoolName: string

    @IsString({ message: "The admin school name contains unsupported characters"})
    @IsNotEmpty({ message: "The school admin name can't be empty"})
    @MinLength(4, {message: "the admin school name must be at least 4 characters length"})
    @MaxLength(20, {message: "The admin school name can't be more than 20 characters length"})
    adminName: string

    @IsNotEmpty({ message: "The email can't be empty"})
    @IsEmail({}, { message: "The email is not valid"})
    email: string

    @IsNotEmpty({ message: "The password can't be empty"} )
    @IsString({ message: "The password contains unsupported characters" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*])[A-Za-z0-9!@#$%&*]{8,}$/, { message: 'Password too weak' })
    password: string
}