
import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AnimatedBadgeProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof badgeVariants> {
  animation?: "pulse" | "bounce" | "none";
}

function AnimatedBadge({ 
  className, 
  variant, 
  animation = "none",
  ...props 
}: AnimatedBadgeProps) {
  const getAnimationProps = () => {
    switch (animation) {
      case "pulse":
        return {
          animate: {
            scale: [1, 1.05, 1],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop" as const
            }
          }
        };
      case "bounce":
        return {
          animate: {
            y: ["0%", "-15%", "0%"],
            transition: {
              duration: 1,
              repeat: Infinity,
              repeatType: "loop" as const
            }
          }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div 
      className={cn(badgeVariants({ variant }), className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      {...getAnimationProps()}
      {...props} 
    />
  );
}

export { AnimatedBadge, badgeVariants };
