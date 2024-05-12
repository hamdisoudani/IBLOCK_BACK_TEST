import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class CreateClassRequestDto {
    @IsString()
    @IsNotEmpty()
    className: string
}