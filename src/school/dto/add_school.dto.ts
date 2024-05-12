import { IsNotEmpty, IsString } from "class-validator";

export class AddSchoolDto {

    @IsString()
    @IsNotEmpty()
    schoolName: string

}