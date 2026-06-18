import { AppError } from "../../middleware/error.middleware";

const STOCK_HELD_STATUSES = new Set([
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
]);
const STOCK_HELD_STATUS_LIST = Array.from(STOCK_HELD_STATUSES);

type OrderItemForStock = {
  variantId: string;
  quantity: number;
  variant?: {
    stock?: number;
    product?: {
      name?: string;
    };
  } | null;
};

type OrderForTransition = {
  id: string;
  status: string;
  discountId?: string | null;
  items: OrderItemForStock[];
};

export function orderHoldsStock(status: string) {
  return STOCK_HELD_STATUSES.has(status);
}

async function decrementOrderStock(tx: any, order: OrderForTransition) {
  const variants = await tx.productVariant.findMany({
    where: { id: { in: order.items.map((item) => item.variantId) } },
    include: { product: { select: { name: true } } },
  });

  for (const item of order.items) {
    const variant = variants.find((v: any) => v.id === item.variantId);
    if (!variant) {
      throw new AppError("A product variant in this order no longer exists", 409);
    }
    if (variant.stock < item.quantity) {
      throw new AppError(
        `Not enough stock for "${variant.product?.name || "item"}"`,
        409,
      );
    }
  }

  for (const item of order.items) {
    const updated = await tx.productVariant.updateMany({
      where: { id: item.variantId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });

    if (updated.count !== 1) {
      const variant = variants.find((v: any) => v.id === item.variantId);
      throw new AppError(
        `Not enough stock for "${variant?.product?.name || "item"}"`,
        409,
      );
    }
  }

  if (order.discountId) {
    await tx.discountCode.update({
      where: { id: order.discountId },
      data: { usesCount: { increment: 1 } },
    });
  }
}

async function releaseOrderStock(tx: any, order: OrderForTransition) {
  for (const item of order.items) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
  }

  if (order.discountId) {
    await tx.discountCode.updateMany({
      where: { id: order.discountId, usesCount: { gt: 0 } },
      data: { usesCount: { decrement: 1 } },
    });
  }
}

export async function applyOrderStatusTransition(
  tx: any,
  order: { id: string },
  nextStatus: string,
  extraData: Record<string, unknown> = {},
) {
  const currentOrder = await tx.order.findUnique({
    where: { id: order.id },
    include: { items: true },
  });

  if (!currentOrder) {
    throw new AppError("Order not found", 404);
  }

  const heldBefore = orderHoldsStock(currentOrder.status);
  const heldAfter = orderHoldsStock(nextStatus);
  const updateData = {
    ...extraData,
    status: nextStatus,
  };

  if (!heldBefore && heldAfter) {
    const claimed = await tx.order.updateMany({
      where: {
        id: currentOrder.id,
        status: { notIn: STOCK_HELD_STATUS_LIST },
      },
      data: updateData,
    });

    if (claimed.count === 1) {
      await decrementOrderStock(tx, currentOrder);
    } else {
      await tx.order.update({
        where: { id: currentOrder.id },
        data: updateData,
      });
    }

    return tx.order.findUniqueOrThrow({ where: { id: currentOrder.id } });
  }

  if (heldBefore && !heldAfter) {
    const released = await tx.order.updateMany({
      where: {
        id: currentOrder.id,
        status: { in: STOCK_HELD_STATUS_LIST },
      },
      data: updateData,
    });

    if (released.count === 1) {
      await releaseOrderStock(tx, currentOrder);
    } else {
      await tx.order.update({
        where: { id: currentOrder.id },
        data: updateData,
      });
    }

    return tx.order.findUniqueOrThrow({ where: { id: currentOrder.id } });
  }

  return tx.order.update({
    where: { id: currentOrder.id },
    data: updateData,
  });
}
