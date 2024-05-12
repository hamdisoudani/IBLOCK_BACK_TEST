import { IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString } from "class-validator";

export class CreateBlockDto {
    @IsNotEmpty({message: "Something is missing or wrong, please try again later"})
    @IsString({message: "Something is missing or wrong, please try again later"})
    name: string;

    @IsNotEmpty({message: "Something is missing or wrong, please try again later"})
    @IsString({message: "Something is missing or wrong, please try again later"})
    blockDefinition: string;

    @IsNotEmpty({message: "Something is missing or wrong, please try again later"})
    @IsString({message: "Something is missing or wrong, please try again later"})
    pythonCode: string;

    @IsOptional()
    @IsMongoId({message: "Something is missing or wrong, please try again later"})
    categoryId?: string;

    @IsNotEmpty({message: "Something is missing or wrong, please try again later"})
    @IsString({message: "Something is missing or wrong, please try again later"})
    factoryXml: string;
}