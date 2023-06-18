import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { categoriesMock, categoryMock } from './category.mock';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    categoryService = module.get<CategoryService>(CategoryService);
    prismaService = module.get(PrismaService);
  });

  describe('list', () => {
    it('should return all categories', async () => {
      prismaService.category.findMany.mockResolvedValueOnce(categoriesMock);

      const result = await categoryService.list();

      expect(result.length).toEqual(categoriesMock.length);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      prismaService.category.create.mockResolvedValueOnce(categoryMock);
      const input: CreateCategoryDto = {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
      };

      const result = await categoryService.create(input);

      expect(result).toMatchObject(categoryMock);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      prismaService.category.findUnique.mockResolvedValueOnce(categoryMock);
      prismaService.category.delete.mockResolvedValueOnce(categoryMock);

      const result = await categoryService.delete(faker.number.int());

      expect(result).toBeUndefined();
    });

    it('should throw an error when category does not exist', async () => {
      prismaService.category.findUnique.mockResolvedValueOnce(null);

      await expect(
        categoryService.delete(faker.number.int()),
      ).rejects.toThrowError(new NotFoundException('Category not found'));
    });
  });
});