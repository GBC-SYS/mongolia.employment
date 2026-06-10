import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-medium px-3 py-1",
  {
    variants: {
      variant: {
        default: "bg-[#dcfce7] text-[#166534]",
        secondary: "bg-stone-100 text-stone-600",
        destructive: "bg-red-100 text-red-700",
        outline: "border border-stone-200 text-stone-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
