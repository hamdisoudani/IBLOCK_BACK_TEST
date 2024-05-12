import { IsMongoId, IsNotEmpty } from "class-validator";

export class LeaveProjectDto {
    @IsMongoId()
    @IsNotEmpty()
    projectId: string;
}