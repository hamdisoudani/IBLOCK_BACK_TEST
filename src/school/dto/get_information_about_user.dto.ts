import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetInformationAboutUserDto {
    @IsNotEmpty()
    @IsMongoId()
    userID: string
}