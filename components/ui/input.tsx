// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string[];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label htmlFor={props.id} className="mb-2 block text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative mt-2 rounded-md">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <div
            id={`${props.id}-error`}
            aria-live="polite"
            className="mt-2 text-sm text-red-500"
          >
            {error.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };