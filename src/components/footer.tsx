import { SOCIAL_LINKS } from '@/lib/data';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background border-t-4 border-foreground">
      <div className="section-container section-padding !py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-background/80 text-center md:text-left font-body">
            &copy; {currentYear} Hakkan Parbej Shah. All rights reserved.
          </p>
          <div className="flex items-center space-x-2">
            {SOCIAL_LINKS.map(social => (
                <Link key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">
                  <social.icon className="h-6 w-6 text-background/80 hover:text-primary transition-colors" />
                </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
