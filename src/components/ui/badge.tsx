import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans",
  {
    variants: {
      variant: {
        default: "bg-[#3a51fb]/10 text-[#3a51fb]",
        secondary: "bg-[#f4f4f4] text-[#666666]",
        success: "bg-[#f0d63d]/20 text-[#7a6b00]",
        warning: "bg-[#e58bc8]/20 text-[#8b3a6b]",
        destructive: "bg-[#dc3d35]/10 text-[#dc3d35]",
        outline: "border border-[#e5e5e5] text-[#666666]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
