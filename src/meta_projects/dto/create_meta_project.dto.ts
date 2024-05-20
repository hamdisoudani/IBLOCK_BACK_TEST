import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateMetaProjectDto {
    @IsString({ message: 'Project name has unknown characters'})
    @MaxLength(50, { message: 'Project name is too long'}) 
    @MinLength(3, { message: 'Project name is too short'})
    projectName: string;

    @IsOptional()
    @IsString({ message: 'Project description has unknown characters'})
    @MaxLength(500, { message: 'Project description is too long'})
    projectDescription: string;

    @IsBoolean({ message: 'Collaborative option must be a choosen'})
    collaborative: boolean;
}