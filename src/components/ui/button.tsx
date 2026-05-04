import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#3a51fb] text-white hover:bg-[#2a3de8] focus-visible:ring-[#3a51fb]",
        secondary: "bg-[#f4f4f4] text-black hover:bg-[#e5e5e5] focus-visible:ring-[#3a51fb]",
        outline: "border border-[#e5e5e5] bg-white text-black hover:bg-[#f4f4f4] focus-visible:ring-[#3a51fb]",
        ghost: "text-black hover:bg-[#f4f4f4] focus-visible:ring-[#3a51fb]",
        destructive: "bg-[#dc3d35] text-white hover:bg-[#c73028] focus-visible:ring-[#dc3d35]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";
