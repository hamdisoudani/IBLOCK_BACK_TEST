import { IsMongoId } from "class-validator";

export class DeleteUnsavedProjectCopyDto {
    @IsMongoId()
    projectId: string;
}