"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const loginFormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormSchemaProps = z.infer<typeof loginFormSchema>;

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormSchemaProps>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormSchemaProps) {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/public/auth/login/credential", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const responseBody = await response.json();

      if (response.status === 201) {
        router.push("/");
        form.reset();
        return;
      }

      if (response.status === 200) {
        router.push(`/verify-two-factor-opt?token=${responseBody.userId}`);
        form.reset();
        return;
      }

      if (response.status === 404 || response.status === 401) {
        setError("Usuário ou Senha incorretos.");
        return;
      }

      if (response.status === 403) {
        setError("Email não verificado.");
        return;
      }

      console.error("💥 Erro ao realizar o Login com senha e password");
    } catch (error) {
      console.error("💥 Erro ao realizar o Login com senha e password - ", error);
      setError("Falha ao realizar o login.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard", // Redirige al dashboard después del inicio de sesión
    });
  }

  async function handleGithubLogin() {
    setIsLoading(true);
    await signIn("github", {
      callbackUrl: "/dashboard", // Redirige al dashboard después del inicio de sesión
    });
  }

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico y contraseña a continuación para acceder a su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="Escriba su e-mail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Contraseña</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="ml-auto inline-block rounded-sm text-[14px] leading-[20px] tracking-[0.1px] underline ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsPasswordVisible((prev) => !prev)}
                          className="absolute right-0 text-muted-foreground/50 hover:bg-transparent hover:text-muted-foreground"
                        >
                          {isPasswordVisible ? (
                            <>
                              <Eye size={20} />
                              <span className="sr-only">Ocultar senha</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={20} />
                              <span className="sr-only">Mostrar senha</span>
                            </>
                          )}
                        </Button>
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <FormMessage>{error}</FormMessage>}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 animate-spin" /> Carregando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-5 space-y-4">
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              type="button"
            >
              Entrar con Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGithubLogin}
              type="button"
            >
              Entrar con Github
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;