"use client";

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard", // Redirige al dashboard después del inicio de sesión
    });
  }

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Ingrese con su cuenta de Google para acceder a su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-5 space-y-4">
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              type="button"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 animate-spin" /> Cargando...
                </>
              ) : (
                "Entrar con Google"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;