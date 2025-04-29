
import React from 'react';
import { motion } from 'framer-motion';

interface HealableLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
  animateOnHover?: boolean;
}

const HealableLogo: React.FC<HealableLogoProps> = ({ 
  size = 'md', 
  withText = true,
  className = '',
  animateOnHover = false
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.3 } }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <motion.div 
        className="relative"
        variants={animateOnHover ? logoVariants : undefined}
        initial="initial"
        whileHover={animateOnHover ? "hover" : undefined}
      >
        <img 
          src="/lovable-uploads/28f13eaf-b76b-49cf-aa90-03a21fad5212.png" 
          alt="Healable Logo" 
          className={`${sizeClasses[size]} object-contain`}
        />
      </motion.div>
      
      {withText && (
        <div className="ml-3 font-serif font-medium text-healable-secondary" style={{ 
          fontSize: size === 'sm' ? '1.2rem' : size === 'md' ? '1.8rem' : '2.2rem' 
        }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
            Healable
          </span>
          <span className="text-healable-primary">Insight</span>
        </div>
      )}
    </div>
  );
};

export default HealableLogo;
