"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/app/ui/button";
import { signIn } from "next-auth/react";

const FormRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleGoogleSignIn() {
    setError(null);
    startTransition(async () => {
      const response = await signIn("google", { callbackUrl: "/dashboard" });
      if (response?.error) {
        setError(response.error);
      }
    });
  }

  return (
    <div className="max-w-52">
      <h1>Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <Button
        onClick={handleGoogleSignIn}
        disabled={isPending}
      >
        Sign in with Google
      </Button>
    </div>
  );
};

export default FormRegister;