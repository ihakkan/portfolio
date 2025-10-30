'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NAV_LINKS } from '@/lib/data';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import AnimatedHamburgerIcon from './animated-hamburger-icon';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionIds = NAV_LINKS.map(link => link.href);
  const activeId = useScrollSpy(sectionIds, { rootMargin: '-50% 0px -50% 0px' });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 border-b-4 border-foreground',
        isScrolled ? 'bg-background/80 backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="section-container flex h-20 items-center justify-between">
        <Link href="/" className="font-headline text-3xl font-bold text-primary tracking-wider">
          Hakkan
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} passHref>
              <Button
                variant="ghost"
                className={cn(
                  'font-headline text-lg tracking-wide transition-colors hover:text-primary',
                  activeId === link.href.substring(1)
                    ? 'text-primary'
                    : 'text-foreground/80'
                )}
              >
                {link.name}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
            <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={toggleMenu} variant="ghost" size="icon" aria-label="Toggle Menu">
            <AnimatedHamburgerIcon isOpen={isOpen} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg pb-4 border-t-4 border-foreground">
          <nav className="flex flex-col items-center space-y-2 pt-4">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-xl font-headline tracking-wider',
                    activeId === link.href.substring(1)
                      ? 'text-primary'
                      : 'text-foreground/80'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
