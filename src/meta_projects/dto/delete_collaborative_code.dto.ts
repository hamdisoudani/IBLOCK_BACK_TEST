import { IsMongoId, IsNotEmpty } from "class-validator";

export class DeleteCollaborativeCodeDto {
    @IsNotEmpty({ message: 'Please provide a code'})
    @IsMongoId({ message: 'Please provide a valid code'})
    code: string;
}