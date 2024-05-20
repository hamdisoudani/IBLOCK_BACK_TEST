import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class AddNewCodeToMpDto {

    @IsMongoId({ message: 'Please provide a valid project ID'})
    @IsNotEmpty({ message: 'Please provide a project ID'})
    projectId: string;

    @IsNotEmpty({ message: 'Please provide a name for the project'})
    @IsString({ message: 'Please provide a valid name for the project'})
    @MaxLength(50, { message: 'The project name must be less than 50 characters long'})
    @MinLength(3, { message: 'The project name must be more than 3 characters long'})
    childProjectName: string;

    @IsOptional()
    @IsString({ message: 'Please provide a valid description for the project'})
    @MaxLength(200, { message: 'The project description must be less than 200 characters long'})
    @MinLength(3, { message: 'The project description must be more than 3 characters long'})
    childProjectDescription: string;
}