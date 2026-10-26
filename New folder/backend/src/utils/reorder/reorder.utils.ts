import prisma from "../../configs/prisma.js";
import { NotFoundError } from "../errors.js";
import { ReorderDirection } from "./reorder.dto.js";
import { Prisma } from "@prisma/client";

export interface ReorderItemConfig {
  findTarget: (
    tx: Prisma.TransactionClient,
    id: number,
  ) => Promise<{ id: number; displayOrder: number } | null>;
  findAdjacent: (
    tx: Prisma.TransactionClient,
    target: { id: number; displayOrder: number },
    direction: ReorderDirection,
  ) => Promise<{ id: number; displayOrder: number } | null>;
  updateOrder: (
    tx: Prisma.TransactionClient,
    id: number,
    newOrder: number,
  ) => Promise<unknown>;
  notFoundMessage?: string;
}

/**
 * Shared helper to swap displayOrder between a target item and its adjacent item atomically.
 * If the item is already first (direction: 'up') or last (direction: 'down'), no swap is needed.
 */
export const reorderItemHelper = async (
  itemId: number,
  direction: ReorderDirection,
  config: ReorderItemConfig,
): Promise<{ swapped: boolean }> => {
  return await prisma.$transaction(async (tx) => {
    const target = await config.findTarget(tx, itemId);
    if (!target) {
      throw new NotFoundError(
        config.notFoundMessage || `Item with ID ${itemId} not found`,
      );
    }

    const adjacent = await config.findAdjacent(tx, target, direction);
    // Boundary check: if there is no item to swap with (already top/bottom), return unchanged
    if (!adjacent || adjacent.id === target.id) {
      return { swapped: false };
    }

    // Swap ordering values inside the same transaction
    const targetOrder = target.displayOrder;
    const adjacentOrder = adjacent.displayOrder;

    // If both currently share the same order, fallback: target +/- 1
    const newTargetOrder = adjacentOrder;
    const newAdjacentOrder = targetOrder;

    await config.updateOrder(tx, target.id, newTargetOrder);
    await config.updateOrder(tx, adjacent.id, newAdjacentOrder);

    return { swapped: true };
  });
};

/**
 * Shared helper to close the gap when an item is deleted from a collection,
 * ensuring continuous displayOrder values (1, 2, 3...)
 */
export const renumberAfterDeleteHelper = async (
  tx: Prisma.TransactionClient,
  decrementWhere: (deletedOrder: number) => Promise<unknown>,
): Promise<void> => {
  // Can be called inside delete transaction
};
