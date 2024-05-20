import { IsMongoId, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class JoinCollaborativeMpChildProjectDto {
    @IsNotEmpty({ message: 'Please provide an invitation code'})
    @MaxLength(8, { message: 'The invitation code must be 8 characters long'})
    @MinLength(8, { message: 'The invitation code must be 8 characters long'})
    invitationCode: string;

    @IsMongoId({ message: 'Please provide a valid meta project ID'})
    @IsNotEmpty({ message: 'Please provide a valid meta project ID'})
    metaProjectID: string;
}