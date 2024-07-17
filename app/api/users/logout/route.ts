import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        const response = NextResponse.json({
            message: 'Logout successfully',
            success: true
        });

        // Configuración adecuada de la cookie para eliminarla
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none', 
            path: '/',
            expires: new Date(0) // Expira inmediatamente para eliminar la cookie
        });

        return response;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to logout";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
};