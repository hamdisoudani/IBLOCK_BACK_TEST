import { IsMongoId } from "class-validator";

export class GetAllChildProjectUnderMpDto {
  @IsMongoId()
  metaProjectID: string;
}