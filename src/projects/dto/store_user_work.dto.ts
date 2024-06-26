import { IsJSON, IsMongoId, IsNotEmpty, IsObject } from "class-validator";

export class StoreUserWorkDto {
    @IsMongoId()
    @IsNotEmpty()
    projectId: string;


    @IsNotEmpty()
    workData: string;
}