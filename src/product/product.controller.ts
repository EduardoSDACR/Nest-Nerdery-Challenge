import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { saveImageToStorage } from './helpers/image-storage';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private product: ProductService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  getProducts() {
    return this.product.getProducts();
  }

  @Get('offset')
  @UseInterceptors(ClassSerializerInterceptor)
  getProductsListWithOffset(
    @Query('skip', ParseIntPipe) skip: number,
    @Query('take', ParseIntPipe) take: number,
  ) {
    return this.product.getOffsetPaginationProducts(skip, take);
  }

  @Get(':productId')
  @UseInterceptors(ClassSerializerInterceptor)
  getProductById(@Param('productId', ParseIntPipe) productId: number) {
    return this.product.find(productId);
  }

  @Get('category/:categoryId')
  @UseInterceptors(ClassSerializerInterceptor)
  getProductsByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.product.findCategoryProducts(categoryId);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', saveImageToStorage),
    ClassSerializerInterceptor,
  )
  createProduct(
    @Body() input: CreateProductDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10000000,
        })
        .build({
          exceptionFactory() {
            throw new UnprocessableEntityException(
              'image file format must be jpg, jpeg or png and size less than 10MB',
            );
          },
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.product.create(input, image.filename);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':productId')
  @UseInterceptors(ClassSerializerInterceptor)
  updateProduct(
    @Body() input: UpdateProductDto,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.product.update(input, productId);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Delete(':productId')
  @HttpCode(204)
  async deleteProduct(@Param('productId', ParseIntPipe) productId: number) {
    await this.product.delete(productId);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('disable/:productId')
  @HttpCode(204)
  async disableProduct(@Param('productId', ParseIntPipe) productId: number) {
    await this.product.disableProduct(productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch('like/:productId')
  @HttpCode(204)
  async likeProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @GetUser('uuid') userUuid: string,
  ) {
    await this.product.likeProduct(productId, userUuid);
  }

  @ApiBearerAuth()
  @Roles(Role.MANAGER)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('image/:productId')
  @UseInterceptors(
    FileInterceptor('image', saveImageToStorage),
    ClassSerializerInterceptor,
  )
  updateProductImage(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 10000000,
        })
        .build({
          exceptionFactory() {
            throw new UnprocessableEntityException(
              'image file format must be jpg, jpeg or png and size less than 10MB',
            );
          },
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.product.updateProductImage(productId, image.filename);
  }
}
