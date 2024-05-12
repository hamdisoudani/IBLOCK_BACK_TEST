import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blocks, BlocksDocument } from './schemas/blocks.schema';
import { Model, Types } from 'mongoose';
import { CreateBlockDto } from './dto/create_block.dto';
import { BlocksCategory } from './schemas/blocks_category.schema';
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
            if(checkIfCategoryExist) throw new HttpException("Category already exist", HttpStatus.OK);

            return await this.blocksCategoryModel.create({
                name: body.name,
                createdBy: token.userId
            });
        } catch (error) {
            if(error instanceof UnauthorizedException ||error instanceof BadRequestException) throw error;

            throw new InternalServerErrorException("An error occured while creating category");
        }
        
    }


    getBlocksByCategory(body: GetBlocksByCategoryDto): Promise<BlocksDocument[]> {
        try {
            const { categoryId } = body;
            
            return this.blocksModel.find({categoryId}).exec(); 
        } catch (error) {
            throw new InternalServerErrorException("An error occured while fetching blocks");
        }
    }

    getBlocsForSpecificProjectTemplate(): Promise<BlocksDocument[]> {
        try {
            // Get all blocks with only projection of name, blockDefinition and python code
            return this.blocksModel.find({}, {name: 1, blockDefinition: 1, pythonCode: 1}).exec();

        } catch (error) {
            throw new InternalServerErrorException("An error occured while fetching blocks");   
        }
    }
}
