import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, Max, MinLength, MaxLength, Matches } from "class-validator";

export class ChangeSchoolAdminDto {
    @IsNotEmpty({ message: 'School id is required' })
    @IsMongoId({ message: 'Invalid school id' })
    schoolID: string;

    @IsNotEmpty({ message: 'The admin email is required' })
    @IsEmail({}, { message: 'Invalid email' })
    adminEmail: string;

    @IsNotEmpty({ message: 'The admin name is required' })
    @IsString({ message: 'Invalid admin name' })
    @MinLength(3, { message: 'Admin name is too short' })
    @MaxLength(50, { message: 'Admin name is too long' })
    adminName: string;

    @IsNotEmpty({ message: 'The admin password is required' })
    @IsString({ message: 'Invalid admin password' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&*])[A-Za-z0-9!@#$%&*]{8,}$/, { message: 'Password too weak' })
    adminPassword: string;
}