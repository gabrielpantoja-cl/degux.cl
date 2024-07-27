"use client";

import React from "react"; // Agrega esta línea
import { Button } from "@/app/ui/button";
import { signIn } from "next-auth/react";

interface ButtonSocialProps {
  children: React.ReactNode;
  provider: string;
}

const ButtonSocial = ({ children, provider }: ButtonSocialProps) => {
  const handleClick = async () => {
    await signIn(provider);
  };

  return <Button onClick={handleClick}>{children}</Button>;
};

export default ButtonSocial;