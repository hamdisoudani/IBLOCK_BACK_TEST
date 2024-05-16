import { IsJSON, IsMongoId, IsNotEmpty, IsObject } from "class-validator";

export class StoreCopyOfProjectDto {
    @IsMongoId()
    @IsNotEmpty()
    projectId: string;


    @IsNotEmpty()
    workCopy: string;
}