import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true })
export class BlocksCategory {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true })
    createdBy: Types.ObjectId;
}

export const BlocksCategorySchema = SchemaFactory.createForClass(BlocksCategory);
export type BlocksCategoryDocument = HydratedDocument<BlocksCategory>;