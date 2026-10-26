import prisma from "../../../configs/prisma.js";
import { CreateTrackRecordSectionRequestDto } from "../dtos/requests/createTrackRecordSection.dto.js";
import { UpdateTrackRecordSectionRequestDto } from "../dtos/requests/updateTrackRecordSection.dto.js";
import { TrackRecordSectionResponseDto } from "../dtos/responses/trackRecordSectionResponse.dto.js";
import { NotFoundError, ConflictError } from "../../../utils/errors.js";
import { reorderItemHelper } from "../../../utils/reorder/reorder.utils.js";
import { ReorderDirection } from "../../../utils/reorder/reorder.dto.js";
import { TrackRecordSection, TrackRecordStat } from "@prisma/client";

type TrackRecordSectionWithStats = TrackRecordSection & {
  stats: TrackRecordStat[];
};

const mapTrackRecordSectionResponse = (
  section: TrackRecordSectionWithStats,
): TrackRecordSectionResponseDto => {
  return {
    id: section.id,
    badge: section.badge,
    title: section.title,
    description: section.description,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
    stats: (section.stats || []).map((stat) => ({
      id: stat.id,
      title: stat.title,
      value: stat.value,
      icon: stat.icon,
      displayOrder: stat.displayOrder,
      isActive: stat.isActive,
      trackRecordSectionId: stat.trackRecordSectionId,
      createdAt: stat.createdAt,
      updatedAt: stat.updatedAt,
    })),
  };
};

export const getTrackRecordSectionService = async (
  publicRequest = false,
): Promise<TrackRecordSectionResponseDto> => {
  const section = await prisma.trackRecordSection.findUnique({
    where: { id: 1 },
    include: {
      stats: {
        where: publicRequest ? { isActive: true } : undefined,
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!section) {
    throw new NotFoundError("Track record section has not been created yet");
  }

  return mapTrackRecordSectionResponse(section);
};

export const createTrackRecordSectionService = async (
  dto: CreateTrackRecordSectionRequestDto,
): Promise<TrackRecordSectionResponseDto> => {
  const existing = await prisma.trackRecordSection.findUnique({
    where: { id: 1 },
  });

  if (existing) {
    throw new ConflictError(
      "Track record section already exists. Use update instead.",
    );
  }

  const section = await prisma.trackRecordSection.create({
    data: {
      id: 1,
      badge: dto.badge,
      title: dto.title,
      description: dto.description,
      stats:
        dto.stats && dto.stats.length > 0
          ? {
              create: dto.stats.map((s, index) => ({
                title: s.title,
                value: s.value,
                icon: s.icon,
                displayOrder: index + 1,
                isActive: s.isActive !== undefined ? s.isActive : true,
              })),
            }
          : undefined,
    },
    include: {
      stats: {
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  return mapTrackRecordSectionResponse(section);
};

export const updateTrackRecordSectionService = async (
  dto: UpdateTrackRecordSectionRequestDto,
): Promise<TrackRecordSectionResponseDto> => {
  const existing = await prisma.trackRecordSection.findUnique({
    where: { id: 1 },
    include: {
      stats: true,
    },
  });

  if (!existing) {
    throw new NotFoundError("Track record section not found");
  }

  const updated = await prisma.$transaction(async (tx) => {
    // 1. If stats collection is explicitly provided:
    // - If empty array: remove all existing stats
    // - If non-empty array: delete existing and create new ones
    if (dto.stats !== undefined) {
      await tx.trackRecordStat.deleteMany({
        where: { trackRecordSectionId: 1 },
      });

      if (dto.stats.length > 0) {
        await tx.trackRecordStat.createMany({
          data: dto.stats.map((s, index) => ({
            trackRecordSectionId: 1,
            title: s.title,
            value: s.value,
            icon: s.icon,
            displayOrder: index + 1,
            isActive: s.isActive !== undefined ? s.isActive : true,
          })),
        });
      }
    }

    // 2. Update TrackRecordSection record
    const section = await tx.trackRecordSection.update({
      where: { id: 1 },
      data: {
        badge: dto.badge ?? existing.badge,
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
      },
      include: {
        stats: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    return section;
  });

  return mapTrackRecordSectionResponse(updated);
};

export const reorderTrackRecordStatService = async (
  statId: number,
  direction: ReorderDirection,
): Promise<void> => {
  await reorderItemHelper(statId, direction, {
    notFoundMessage: `Track record statistic with ID ${statId} not found`,
    findTarget: async (tx, itemId) => {
      return await tx.trackRecordStat.findFirst({
        where: { id: itemId, trackRecordSectionId: 1 },
        select: { id: true, displayOrder: true },
      });
    },
    findAdjacent: async (tx, target, dir) => {
      if (dir === "up") {
        return await tx.trackRecordStat.findFirst({
          where: {
            trackRecordSectionId: 1,
            displayOrder: { lt: target.displayOrder },
          },
          orderBy: { displayOrder: "desc" },
          select: { id: true, displayOrder: true },
        });
      } else {
        return await tx.trackRecordStat.findFirst({
          where: {
            trackRecordSectionId: 1,
            displayOrder: { gt: target.displayOrder },
          },
          orderBy: { displayOrder: "asc" },
          select: { id: true, displayOrder: true },
        });
      }
    },
    updateOrder: async (tx, itemId, newOrder) => {
      await tx.trackRecordStat.update({
        where: { id: itemId },
        data: { displayOrder: newOrder },
      });
    },
  });
};

export const deleteTrackRecordSectionService = async (): Promise<void> => {
  const existing = await prisma.trackRecordSection.findUnique({
    where: { id: 1 },
  });

  if (!existing) {
    throw new NotFoundError("Track record section not found");
  }

  // Deleting the singleton section cascades and deletes all related stats
  await prisma.trackRecordSection.delete({
    where: { id: 1 },
  });
};
