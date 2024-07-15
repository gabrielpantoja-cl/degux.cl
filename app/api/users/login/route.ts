import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const POST = async (request: NextRequest) => {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;

        // Verifica si el usuario existe en la base de datos
        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const tokenData = {
            id: user.id,
            username: user.name,
            email: user.email
        };

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        });

        response.cookies.set("token", token, { httpOnly: true });

        return response;
    } catch (err: any) {
        console.log(err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
};