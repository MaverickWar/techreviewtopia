import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        award: 
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        "award-editors-choice": 
          "border-transparent bg-gradient-to-r from-purple-600 to-purple-800 text-white",
        "award-best-value": 
          "border-transparent bg-gradient-to-r from-blue-500 to-blue-700 text-white",
        "award-best-performance": 
          "border-transparent bg-gradient-to-r from-orange-500 to-red-500 text-white",
        "award-highly-recommended": 
          "border-transparent bg-gradient-to-r from-green-500 to-green-700 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
