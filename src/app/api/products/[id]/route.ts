import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { Dimension } from "@prisma/client";

// PUT /api/products/[id]
// Update an existing product (Admin Only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyJWT(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, sku, dimension, baseUnit, stockQuantity, basePrice, category, description } = body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    // SKU uniqueness check if SKU is updated
    if (sku && sku !== product.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingProduct) {
        return NextResponse.json({ message: "A product with this SKU already exists." }, { status: 400 });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : product.name,
        sku: sku !== undefined ? sku : product.sku,
        dimension: dimension !== undefined ? (dimension as Dimension) : product.dimension,
        baseUnit: baseUnit !== undefined ? baseUnit : product.baseUnit,
        stockQuantity: stockQuantity !== undefined ? parseFloat(stockQuantity) : product.stockQuantity,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : product.basePrice,
        category: category !== undefined ? category : product.category,
        description: description !== undefined ? description : product.description,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// DELETE /api/products/[id]
// Delete a product (Admin Only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = verifyJWT(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
