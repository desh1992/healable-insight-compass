
import React from 'react';

interface HealableLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

const HealableLogo: React.FC<HealableLogoProps> = ({ 
  size = 'md', 
  withText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <div className={`healable-gradient rounded-full ${sizeClasses[size]} aspect-square flex items-center justify-center`}>
          <span className="text-white font-bold" style={{ 
            fontSize: size === 'sm' ? '1.2rem' : size === 'md' ? '1.8rem' : '2.2rem' 
          }}>H</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-healable-accent rounded-full w-1/3 h-1/3 flex items-center justify-center">
          <div className="bg-white rounded-full w-3/4 h-3/4"></div>
        </div>
      </div>
      
      {withText && (
        <div className="ml-3 font-bold text-healable-secondary" style={{ 
          fontSize: size === 'sm' ? '1.2rem' : size === 'md' ? '1.8rem' : '2.2rem' 
        }}>
          Healable<span className="text-healable-primary">Insight</span>
        </div>
      )}
    </div>
  );
};

export default HealableLogo;
