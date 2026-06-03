import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { convertToBase, getUnitPriceInTargetUnit } from "@/lib/units";

// GET /api/orders
// Retrieve orders (Admins see all, Users see only their own)
export async function GET(req: Request) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const queryOptions: any = {
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    };

    // If not an admin, filter by user id
    if (user.role !== "ADMIN") {
      queryOptions.where = { userId: user.id };
    }

    const orders = await prisma.order.findMany(queryOptions);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// POST /api/orders
// Place a new quotation/order
export async function POST(req: Request) {
  try {
    const user = verifyJWT(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body; // Array of { productId, orderedQuantity, orderedUnit }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Order must contain at least one item." }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData: any[] = [];

    // Loop through each item to validate, convert, and calculate prices
    for (const item of items) {
      const { productId, orderedQuantity, orderedUnit } = item;

      if (!productId || orderedQuantity === undefined || !orderedUnit) {
        return NextResponse.json({ message: "Invalid item details." }, { status: 400 });
      }

      if (parseFloat(orderedQuantity) <= 0) {
        return NextResponse.json({ message: "Quantities must be greater than zero." }, { status: 400 });
      }

      // Fetch the product
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json({ message: `Product with ID ${productId} not found.` }, { status: 404 });
      }

      // Convert quantity to base unit
      const convertedQuantity = convertToBase(parseFloat(orderedQuantity), orderedUnit);

      // Calculate unit price in ordered unit
      const unitPrice = getUnitPriceInTargetUnit(product.basePrice, orderedUnit);

      // Line total
      const lineTotal = unitPrice * parseFloat(orderedQuantity);

      totalAmount += lineTotal;

      orderItemsData.push({
        productId,
        orderedQuantity: parseFloat(orderedQuantity),
        orderedUnit,
        convertedQuantity,
        unitPrice,
        lineTotal,
      });
    }

    // Create the order and items in a transaction
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: "PENDING",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST ORDER ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
