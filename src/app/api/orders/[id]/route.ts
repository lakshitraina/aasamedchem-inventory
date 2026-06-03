import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";

// PUT /api/orders/[id]
// Update order status (Approve/Reject) - (Admin Only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyJWT(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body; // "APPROVED" or "REJECTED"

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ message: "Invalid status value. Must be APPROVED or REJECTED." }, { status: 400 });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ message: "This order has already been processed." }, { status: 400 });
    }

    if (status === "REJECTED") {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json(updatedOrder);
    }

    // For APPROVED status, perform stock check and deduction
    // Wrap in a transaction to ensure atomic execution
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Loop through items to check stock levels
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product "${item.productId}" not found.`);
          }

          if (product.stockQuantity < item.convertedQuantity) {
            throw new Error(
              `Insufficient stock for product "${product.name}". Available: ${product.stockQuantity} ${product.baseUnit}, Required: ${item.convertedQuantity} ${product.baseUnit}.`
            );
          }
        }

        // 2. Deduct stock for each item
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.convertedQuantity,
              },
            },
          });
        }

        // 3. Update order status to APPROVED
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status: "APPROVED" },
          include: {
            items: true,
          },
        });

        return updatedOrder;
      });

      return NextResponse.json(result);
    } catch (txError: any) {
      console.warn("STOCK TRANSACTION FAILED:", txError.message);
      return NextResponse.json({ message: txError.message }, { status: 400 });
    }
  } catch (error) {
    console.error("PUT ORDER ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
