import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            }
        );

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return NextResponse.json(
            { message: "Server Error" },
            { status: 500 }
        );
    }
}