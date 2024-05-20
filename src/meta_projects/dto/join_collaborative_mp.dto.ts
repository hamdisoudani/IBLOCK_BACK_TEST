import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class JoinCollaborativeMpDto {
    @IsNotEmpty({ message: 'Please provide an invitation code'})
    @MaxLength(8, { message: 'The invitation code must be 8 characters long'})
    @MinLength(8, { message: 'The invitation code must be 8 characters long'})
    invitationCode: string;

    // @IsString({ message: 'Please provide a name for the project'})
    // @IsNotEmpty({ message: 'Please provide a name for the project'})
    // name: string;

    // @IsString({ message: 'Please provide a description for the project'})
    // @IsOptional()
    // description: string;
}