// app/components/button-social.tsx
"use client";

import React from "react";
import { Button } from "@/app/ui/button";
import { signIn } from "next-auth/react";

interface ButtonSocialProps {
  children: React.ReactNode;
  provider: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ButtonSocial = ({ children, provider, className, onClick, disabled }: ButtonSocialProps) => {
  const handleClick = async () => {
    if (onClick) {
      onClick();
    } else {
      await signIn(provider);
    }
  };

  return (
    <Button onClick={handleClick} className={className} disabled={disabled}>
      {children}
    </Button>
  );
};

export default ButtonSocial;