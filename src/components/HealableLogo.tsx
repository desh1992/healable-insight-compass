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
        <div className={`rounded-full bg-[#003B57] ${sizeClasses[size]} aspect-square flex items-center justify-center`}>
          <img 
            src="/healable-new-logo.svg" 
            alt="Healable Logo" 
            className="w-3/4 h-3/4"
          />
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
