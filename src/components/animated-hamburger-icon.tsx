'use client';

import { cn } from '@/lib/utils';

interface AnimatedHamburgerIconProps {
  isOpen: boolean;
  className?: string;
}

const AnimatedHamburgerIcon = ({ isOpen, className }: AnimatedHamburgerIconProps) => {
  return (
    <div className={cn('w-6 h-6 flex flex-col justify-center items-center', className)}>
      <span
        className={cn(
          'block h-0.5 w-full bg-current transition-all duration-300 ease-in-out',
          isOpen ? 'transform rotate-45 translate-y-[4px]' : 'transform rotate-0'
        )}
      />
      <span
        className={cn(
          'block h-0.5 w-full bg-current my-1.5 transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-0' : 'opacity-100'
        )}
      />
      <span
        className={cn(
          'block h-0.5 w-full bg-current transition-all duration-300 ease-in-out',
          isOpen ? 'transform -rotate-45 -translate-y-[10px]' : 'transform rotate-0'
        )}
      />
    </div>
  );
};

export default AnimatedHamburgerIcon;
