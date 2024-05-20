import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetMpInformationsDto {

    @IsNotEmpty({ message: 'Please provide a project ID'})
    @IsMongoId({ message: 'Please provide a valid project ID'})
    metaProjectID: string;
}