import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


@Schema({timestamps: true})
export class Blocks {
    @Prop({type: String, required: true, unique: true})
    name: string;

    @Prop({type: String, required: true})
    blockDefinition: string;

    @Prop({type: Types.ObjectId, required: true, ref: 'Users'})
    createdBy: Types.ObjectId;

    @Prop({type: String, required: true})
    pythonCode: string;

    @Prop({type: String, required: true})
    factoryXml: string;

    @Prop({type: Types.ObjectId, required: false, default: null})
    categoryId?: Types.ObjectId;
}

export const BlocksSchema = SchemaFactory.createForClass(Blocks);
export type BlocksDocument = HydratedDocument<Blocks>;