import { IsMongoId, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Types } from "mongoose";

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Category name is required'})
    @IsString({ message: 'Category name must be a string'})
    @MaxLength(50, { message: 'Category name must be less than 50 characters'})
    @MinLength(3, { message: 'Category name must be more than 3 characters'})
    name: string;

    @IsNotEmpty({ message: 'Blocks list is required'})
    @IsMongoId({ each: true, message: 'Blocks list must be an array of ObjectId'})
    blocksList: Types.ObjectId[];
}