import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClassDto {

    @IsString()
    @IsNotEmpty()
    className: string

    @IsString()
    @IsOptional()
    classDescription?: string
}