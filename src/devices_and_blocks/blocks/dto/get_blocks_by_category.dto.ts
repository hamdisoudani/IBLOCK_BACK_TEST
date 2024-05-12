import { IsMongoId, IsNotEmpty } from "class-validator";

export class GetBlocksByCategoryDto {
    @IsNotEmpty()
    @IsMongoId()
    categoryId: string;
}