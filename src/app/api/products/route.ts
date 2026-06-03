import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { Dimension } from "@prisma/client";

// GET /api/products
// Retrieve all products with optional filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const dimension = searchParams.get("dimension") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (dimension && dimension !== "All") {
      where.dimension = dimension as Dimension;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// POST /api/products
// Create a new product (Admin Only)
export async function POST(req: Request) {
  try {
    const user = verifyJWT(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const body = await req.json();
    const { name, sku, dimension, baseUnit, stockQuantity, basePrice, category, description } = body;

    // Validation
    if (!name || !sku || !dimension || !baseUnit || stockQuantity === undefined || basePrice === undefined) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // SKU uniqueness check
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json({ message: "A product with this SKU already exists." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        dimension: dimension as Dimension,
        baseUnit,
        stockQuantity: parseFloat(stockQuantity),
        basePrice: parseFloat(basePrice),
        category: category || null,
        description: description || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
