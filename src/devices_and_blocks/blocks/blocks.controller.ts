import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { RoleGuard } from 'src/middleware/role.guard';
import { Roles } from 'src/utils/decorator/middleware.decorator';
import { CreateBlockDto } from './dto/create_block.dto';
import { CreateCategoryDto } from './dto/create_category.dto';
import { Request } from 'express';
import { accessTokenType } from 'src/utils/types/access_token.type';
import { GetBlocksByCategoryDto } from './dto/get_blocks_by_category.dto';
import { Role } from 'src/users/schemas/users.schema';

@Controller('blocks')
@UseGuards(RoleGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Roles(Role.ROBOTADMIN)
  @Get()
  async getAllBlocks() {
    try {
      const blocks = await this.blocksService.getBlocks();

      return {
        blocks
      }
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ROBOTADMIN)
  @Post('/add')
  async addBlock(@Body() body: CreateBlockDto, @Req() request: Request){
    try {
      const user = request.user as accessTokenType;
      const block = await this.blocksService.createBlock(body, user);

      return {
        "message": "Block created successfully",
        block
      }
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ROBOTADMIN)
  @Post('category')
  async addCategory(@Body() body: CreateCategoryDto, @Req() request: Request) {
    try {
      const token = request.user as accessTokenType;
      const category = await this.blocksService.createNewCategory(body, token);

      return {
        "message": "New category created successfully",
        category
      }
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ROBOTADMIN)
  @Post('category/update')
  async updateCategory(@Body() body: CreateCategoryDto, @Req() request: Request) {
    try {
      const token = request.user as accessTokenType;
      const category = await this.blocksService.updateCategory(body, token);

      return {
        "message": "Category updated successfully",
        category
      }
    } catch (error) {
      throw error;
    }
  }


  @Roles('admin', 'student', 'teacher')
  @Get('category/children')
  async getBlocksByCategory(@Body() body: GetBlocksByCategoryDto) {
    try {
      const blocks = await this.blocksService.getBlocksByCategory(body);

      return {
        blocks
      }
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ROBOTADMIN, Role.STUDENT, Role.TEACHER)
  @Get('predefined')
  async getPredefinedBlocks(@Req() request: Request) {
    try {
      const token = request.user as accessTokenType;
      const definedData = await this.blocksService.getBlocsForSpecificProjectTemplate();
      definedData.forEach(async block => {
        // Add the field owner to the block
        block['data'] = token.userId;
      })

      const toolBox = [
        
        {
          "kind": "categoryToolbox",
          "contents": [
            {
              "kind": "category",
              "name": "Custom Blocks",
              "colour": "#FFA500",
              "contents": [
                {
                  kind: "block",
                  type: "move_forward",
                },
                {
                  kind: "block",
                  type: "move_left",
                },
                {
                  kind: "block",
                  type: "move_right",
                },
                {
                  kind: "block",
                  type: "stop_robot",
                },
              ]
            },
            {
              "kind": "category",
              "name": "Loops",
              "colour": "#F0A500",
              "contents": [
                {
                  kind: "block",
                  type: "controls_repeat",
                },
                {
                  kind: "block",
                  type: "controls_for",
                },
                {
                  kind: "block",
                  type: "controls_whileUntil",
                },
                {
                  kind: "block",
                  type: "controls_forEach",
                },
              ]
            }
          ]
        }
        
      ]

      return {
        definedData,
        toolBox
      }
    } catch (error) {
      throw error;
    }
  }
}
