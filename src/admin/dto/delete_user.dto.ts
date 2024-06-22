import { IsMongoId, IsNotEmpty } from "class-validator";

export class DeleteUserDto {
    @IsNotEmpty({message: "User ID is required"})
    @IsMongoId({message: "Invalid user ID"})
    userID: string;
}