
import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

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

export type AnimationTypes = "none" | "pulse" | "bounce";

export interface AnimatedBadgeProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof badgeVariants> {
  animation?: AnimationTypes;
}

const animationVariants = {
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  bounce: {
    animate: {
      y: ["0%", "-15%", "0%"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
  none: {},
};

const AnimatedBadge = React.forwardRef<HTMLDivElement, AnimatedBadgeProps>(
  ({ className, variant, animation = "none", ...props }, ref) => {
    const animationProps =
      animation !== "none" ? animationVariants[animation] : {};

    return (
      <motion.div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...animationProps}
        {...props}
      />
    );
  }
);

AnimatedBadge.displayName = "AnimatedBadge";

export { AnimatedBadge };
