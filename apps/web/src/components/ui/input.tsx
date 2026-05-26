import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-[40px] w-full rounded-btn border border-neutral-border bg-white px-3 text-[14px] text-neutral-dark outline-none transition-shadow placeholder:text-neutral-muted",
        "focus:border-brand-pink focus:shadow-focus-pink",
        error && "border-brand-pink",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
