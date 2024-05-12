import { IsNotEmpty, IsString } from "class-validator";

export class JoinClassDto {
    
    @IsString()
    @IsNotEmpty()
    invitationCode: string
}