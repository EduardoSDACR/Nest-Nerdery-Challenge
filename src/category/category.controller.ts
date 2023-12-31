import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getCategories() {
    return this.categoryService.list();
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  createCategory(@Body() input: CreateCategoryDto) {
    return this.categoryService.create(input);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Delete(':categoryId')
  @HttpCode(204)
  async deleteCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    await this.categoryService.delete(categoryId);
  }
}
