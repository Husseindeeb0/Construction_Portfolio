import prisma from "../../../configs/prisma.js";
import { CreateCategoryRequestDto } from "../dtos/requests/createCategory.dto.js";
import { UpdateCategoryRequestDto } from "../dtos/requests/updateCategory.dto.js";
import { CategoryResponseDto } from "../dtos/responses/categoryResponse.dto.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../utils/errors.js";
import { reorderItemHelper } from "../../../utils/reorder/reorder.utils.js";
import { ReorderDirection } from "../../../utils/reorder/reorder.dto.js";
import { ProjectCategory } from "@prisma/client";

const mapCategoryResponse = (
  category: ProjectCategory,
): CategoryResponseDto => {
  return {
    id: category.id,
    name: category.name,
    displayOrder: category.displayOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const getProjectCategoriesService = async (): Promise<
  CategoryResponseDto[]
> => {
  const categories = await prisma.projectCategory.findMany({
    orderBy: {
      displayOrder: "asc",
    },
  });

  return categories.map(mapCategoryResponse);
};

export const getProjectCategoryByIdService = async (
  id: number,
): Promise<CategoryResponseDto> => {
  const category = await prisma.projectCategory.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError(`Project category with ID ${id} not found`);
  }

  return mapCategoryResponse(category);
};

export const createProjectCategoryService = async (
  dto: CreateCategoryRequestDto,
): Promise<CategoryResponseDto> => {
  const existing = await prisma.projectCategory.findUnique({
    where: { name: dto.name },
  });

  if (existing) {
    throw new ConflictError(
      `Project category with name "${dto.name}" already exists`,
    );
  }

  // Calculate initial position: max(displayOrder) + 1, starting at 1
  const maxCategory = await prisma.projectCategory.findFirst({
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const initialDisplayOrder = (maxCategory?.displayOrder ?? 0) + 1;

  const category = await prisma.projectCategory.create({
    data: {
      name: dto.name,
      displayOrder: initialDisplayOrder,
    },
  });

  return mapCategoryResponse(category);
};

export const updateProjectCategoryService = async (
  id: number,
  dto: UpdateCategoryRequestDto,
): Promise<CategoryResponseDto> => {
  const existing = await prisma.projectCategory.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Project category with ID ${id} not found`);
  }

  if (dto.name && dto.name !== existing.name) {
    const duplicate = await prisma.projectCategory.findUnique({
      where: { name: dto.name },
    });
    if (duplicate) {
      throw new ConflictError(
        `Project category with name "${dto.name}" already exists`,
      );
    }
  }

  const updated = await prisma.projectCategory.update({
    where: { id },
    data: {
      name: dto.name ?? existing.name,
    },
  });

  return mapCategoryResponse(updated);
};

export const reorderProjectCategoryService = async (
  id: number,
  direction: ReorderDirection,
): Promise<void> => {
  await reorderItemHelper(id, direction, {
    notFoundMessage: `Project category with ID ${id} not found`,
    findTarget: async (tx, itemId) => {
      return await tx.projectCategory.findUnique({
        where: { id: itemId },
        select: { id: true, displayOrder: true },
      });
    },
    findAdjacent: async (tx, target, dir) => {
      if (dir === "up") {
        return await tx.projectCategory.findFirst({
          where: { displayOrder: { lt: target.displayOrder } },
          orderBy: { displayOrder: "desc" },
          select: { id: true, displayOrder: true },
        });
      } else {
        return await tx.projectCategory.findFirst({
          where: { displayOrder: { gt: target.displayOrder } },
          orderBy: { displayOrder: "asc" },
          select: { id: true, displayOrder: true },
        });
      }
    },
    updateOrder: async (tx, itemId, newOrder) => {
      await tx.projectCategory.update({
        where: { id: itemId },
        data: { displayOrder: newOrder },
      });
    },
  });
};

export const deleteProjectCategoryService = async (
  id: number,
): Promise<void> => {
  const existing = await prisma.projectCategory.findUnique({
    where: { id },
    include: {
      projects: {
        select: { id: true },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError(`Project category with ID ${id} not found`);
  }

  if (existing.projects && existing.projects.length > 0) {
    throw new BadRequestError(
      `Cannot delete category "${existing.name}" because ${existing.projects.length} project(s) still reference it`,
    );
  }

  const deletedOrder = existing.displayOrder;

  await prisma.$transaction(async (tx) => {
    await tx.projectCategory.delete({
      where: { id },
    });

    // Renumber remaining categories that had a higher displayOrder atomically
    await tx.projectCategory.updateMany({
      where: { displayOrder: { gt: deletedOrder } },
      data: { displayOrder: { decrement: 1 } },
    });
  });
};
