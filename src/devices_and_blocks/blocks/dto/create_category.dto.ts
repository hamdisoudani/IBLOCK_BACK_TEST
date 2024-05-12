import { IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}