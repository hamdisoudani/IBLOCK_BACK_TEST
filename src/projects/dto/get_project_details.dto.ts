import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetProjectDetailsDto {
  @IsNotEmpty()
  @IsMongoId()
  projectId: string;
}