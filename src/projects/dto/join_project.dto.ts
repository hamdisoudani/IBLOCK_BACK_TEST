import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class JoinProjectDto {
    @MinLength(8, {message: "Invitation code is too short"})
    @MaxLength(8, {message: "Invitation code is too long"})
    @IsNotEmpty()
    invitationCode: string;
}