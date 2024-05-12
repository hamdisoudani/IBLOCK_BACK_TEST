import { IsMongoId, IsNotEmpty } from "class-validator";

export class RemoveProjectDto {
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;
}