import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { Blocks, BlocksSchema } from './schemas/blocks.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { BlocksCategory, BlocksCategorySchema } from './schemas/blocks_category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blocks.name, schema: BlocksSchema }]), 
    MongooseModule.forFeature([{ name: BlocksCategory.name, schema: BlocksCategorySchema }])
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService]
})
export class BlocksModule {}
