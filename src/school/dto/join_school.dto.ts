import { IsNotEmpty, IsString } from "class-validator";

export class JoinSchoolDto {
    @IsString()
    @IsNotEmpty()
    invitationCode: string
}