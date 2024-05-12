import { IsNotEmpty, IsString } from "class-validator";

export class SwitchProfileDto {
    @IsString()
    @IsNotEmpty()
    profileId: string
}