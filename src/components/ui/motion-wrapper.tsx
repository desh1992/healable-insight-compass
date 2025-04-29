
import { motion, MotionProps } from "framer-motion";
import { ReactNode, forwardRef } from "react";
import { fadeIn, fadeInUp, scaleIn, staggerChildren } from "@/lib/animations";

interface MotionWrapperProps extends MotionProps {
  children: ReactNode;
  variant?: "fade" | "fadeUp" | "scale" | "stagger";
  delay?: number;
  className?: string;
  tag?: "div" | "section" | "article" | "aside" | "header" | "footer";
}

const MotionWrapper = forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ 
    children, 
    variant = "fade", 
    delay = 0, 
    className = "", 
    tag = "div", 
    ...rest 
  }, ref) => {
    const Component = motion[tag] as any;
    
    const getVariant = () => {
      switch (variant) {
        case "fade":
          return fadeIn;
        case "fadeUp":
          return fadeInUp;
        case "scale":
          return scaleIn;
        case "stagger":
          return staggerChildren;
        default:
          return fadeIn;
      }
    };

    return (
      <Component
        ref={ref}
        className={className}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariant()}
        transition={{ delay }}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

MotionWrapper.displayName = "MotionWrapper";

export { MotionWrapper };
