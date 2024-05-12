import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

// Update project DTO
export class UpdateProjectDto {
 @IsNotEmpty({message: "Project name is required"})   
 @IsString({message: "Project name must be a string"})
 @MinLength(3, {message: "Project name is too short"})
 @MaxLength(30, {message: "Project name is too long"})
  projectName: string;

  
  //@MinLength(3, {message: "Project description is too short"})
  @MaxLength(100, {message: "Project description is too long"})
  @IsString({message: "Project description must be a string"})
  @IsOptional()
  projectDescription?: string;

  @IsNotEmpty({message: "Project ID is required"})
  @IsMongoId({message: "Invalid project ID"})
  projectId: string;
}