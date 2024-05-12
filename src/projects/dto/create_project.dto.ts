import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsMongoId()
    @IsOptional()
    classId?: string;
}