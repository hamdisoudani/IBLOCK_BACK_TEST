import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blocks, BlocksDocument } from './schemas/blocks.schema';
import { Model, Types } from 'mongoose';
import { CreateBlockDto } from './dto/create_block.dto';
import { BlocksCategory, BlocksCategoryDocument } from './schemas/blocks_category.schema';
import { CreateCategoryDto } from './dto/create_category.dto';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { GetBlocksByCategoryDto } from './dto/get_blocks_by_category.dto';
import { getAllBlocksPipeline } from './pipeline/get_blocks.pipeline';

@Injectable()
export class BlocksService {
    constructor(
        @InjectModel(Blocks.name) private readonly blocksModel: Model<Blocks>,
        @InjectModel(BlocksCategory.name) private readonly blocksCategoryModel: Model<BlocksCategory>,
    ) {}

    async checkIfBlockExists(name: string): Promise<boolean> {
        try {
            const exist = await this.blocksModel.exists({name});

            if(exist) return true;

            return false;
        } catch (error) {
            throw new InternalServerErrorException("An error occured.");
        }
    }

    async getBlocks(): Promise<BlocksDocument[]> {
       try {
            const blocks =  await this.blocksModel.aggregate(getAllBlocksPipeline);
            return blocks;
       } catch (error) {
            throw new InternalServerErrorException("An error occured while fetching blocks");
       }
    }

    async createBlock(body: CreateBlockDto, user: accessTokenType): Promise<BlocksDocument> {
        try {
            const checkIfBlockAlreadyExist = await this.checkIfBlockExists(body.name);

            if(checkIfBlockAlreadyExist) throw new HttpException("Block already exist", HttpStatus.BAD_REQUEST);

            if(body.categoryId) {
                const checkIfCategoryExist = await this.blocksCategoryModel.exists({_id: body.categoryId});

                if(!checkIfCategoryExist) throw new HttpException("Category does not exist", HttpStatus.OK);
            }


            return await this.blocksModel.create({
                name: body.name,
                blockDefinition: body.blockDefinition,
                createdBy: new Types.ObjectId(user.userId),
                pythonCode: body.pythonCode,
                factoryXml: body.factoryXml,
                categoryId: body.categoryId ? body.categoryId: null
            });
        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof BadRequestException || error instanceof HttpException) throw error;
            throw new InternalServerErrorException("An error occured while creating block");
        }
    }

    async createNewCategory(body: CreateCategoryDto, token: accessTokenType): Promise<BlocksCategory> {
        try {
            const checkIfCategoryExist = await this.blocksCategoryModel.exists({name: body.name});
            if(checkIfCategoryExist) throw new BadRequestException("Category already exist");

            // Check if the blocksList is not empty
            if(body.blocksList.length === 0) throw new BadRequestException("Blocks list cannot be empty");

            // Check each block ID if it exists and if it is not already added to a category
            for(const blockId of body.blocksList) {
                const isBlockExist = await this.blocksModel.exists({_id: blockId});
                if(!isBlockExist) throw new BadRequestException(`Block with ID ${blockId} does not exist`);
                // const notAllowed = await this.checkIfBlockIsAlreadyAddedToCategory(blockId);
                // if(notAllowed) throw new BadRequestException(`Block with ID ${blockId} is already added to a category please remove it and try again`);
            }

            return await this.blocksCategoryModel.create({
                name: body.name,
                createdBy: token.userId,
                blocksList: body.blocksList
            });
        } catch (error) {
            if(error instanceof UnauthorizedException ||error instanceof BadRequestException) throw error;

            throw new InternalServerErrorException("An error occured while creating category");
        }
        
    }
    
    async updateCategory(body: CreateCategoryDto, token: accessTokenType): Promise<BlocksCategoryDocument> {
        try {
            const category = await this.blocksCategoryModel.findOne({name: body.name});
            if(!category) throw new BadRequestException("Category does not exist");

            // Check if the blocksList is not empty
            if(body.blocksList.length === 0) throw new BadRequestException("Blocks list cannot be empty");

            // Check of repeated block IDs
            const repeatedBlocks = body.blocksList.filter((blockId, index) => body.blocksList.indexOf(blockId) !== index);
            if(repeatedBlocks.length > 0) throw new BadRequestException(`Block with ID ${repeatedBlocks.join(', ')} is repeated please remove it and try again`);

            // Check each block ID if it exists and if it is not already added to a category
            for(const blockId of body.blocksList) {
                const isBlockExist = await this.blocksModel.exists({_id: blockId});
                if(!isBlockExist) throw new BadRequestException(`Block with ID ${blockId} does not exist`);
                // const notAllowed = await this.checkIfBlockIsAlreadyAddedToCategory(blockId);
                // if(notAllowed) throw new BadRequestException(`Block with ID ${blockId} is already added to a category please remove it and try again`);
            }

            // Update the category
            return await this.blocksCategoryModel.findOneAndUpdate({name: body.name}, {blocksList: body.blocksList}, {new: true});
        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException("An error occured while updating category");
        }
    }

    async getBlocksByCategory(body: GetBlocksByCategoryDto): Promise<BlocksDocument[]> {
        try {
            const { categoryId } = body;
            
            return this.blocksModel.find({categoryId}).exec(); 
        } catch (error) {
            throw new InternalServerErrorException("An error occured while fetching blocks");
        }
    }

    async getBlocsForSpecificProjectTemplate(): Promise<BlocksDocument[]> {
        try {
            // Get all blocks with only projection of name, blockDefinition and python code
            return this.blocksModel.find({}, {name: 1, blockDefinition: 1, pythonCode: 1}).exec();

        } catch (error) {
            throw new InternalServerErrorException("An error occured while fetching blocks");   
        }
    }

    async getBlocksThatWasNotAddedToSpecificCatrgory(): Promise<BlocksDocument[]> {
        try {
            return this.blocksModel.find({categoryId: null}).exec();
        } catch (error) {
            throw new InternalServerErrorException("An error occured while fetching blocks");
        }
    }

    async checkIfBlockIsAlreadyAddedToCategory(blockId: Types.ObjectId): Promise<boolean> {
        try {
            const block = await this.blocksModel.findOne({_id: blockId});
            if(!block) throw new BadRequestException("Block does not exist");

            if(block.categoryId) return true;
            return false;
        } catch (error) {
            if(error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException("An error occured while checking if block is already added to category");
        }
    }

    async getAllAvailableCategoriesFromArray(categories: string[]): Promise<BlocksCategoryDocument[]> {
        try {
            const category = await this.blocksCategoryModel.find({ _id: { $in: categories } });
            return category;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }
}
