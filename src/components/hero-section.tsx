import Link from 'next/link';
import Image from 'next/image';
import { SOCIAL_LINKS } from '@/lib/data';
import AnimatedDiv from './animated-div';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="section-padding border-b-4 border-foreground overflow-hidden">
      <div className="section-container grid md:grid-cols-2 gap-10 items-center min-h-[70vh]">
        <div className="text-center md:text-left">
          <AnimatedDiv>
            <h1 className="font-headline text-6xl font-bold tracking-wider text-primary drop-shadow-[2px_2px_0_hsl(var(--foreground))] md:text-7xl lg:text-8xl">
              Hakkan Parbej Shah
            </h1>
          </AnimatedDiv>
          <AnimatedDiv delay={100}>
            <p className="mt-4 font-headline text-3xl font-bold tracking-wider text-accent md:text-4xl">
              Full Stack Developer
            </p>
          </AnimatedDiv>
          <AnimatedDiv delay={200} className="mt-8 max-w-xl mx-auto md:mx-0">
              <div className="relative p-6 bg-background rounded-lg border-2 border-foreground shadow-lg">
                  <p className="text-lg text-foreground/90 italic">
                      “Turning Ideas into Reality – One Line of Code at a Time”
                  </p>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background border-l-2 border-t-2 border-foreground transform rotate-45 md:left-8"></div>
              </div>
          </AnimatedDiv>
          <AnimatedDiv delay={300} className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
              <Link href="/Hakkan_Parbej_Shah_Resume.pdf" download="Hakkan_Parbej_Shah_Resume.pdf" passHref>
                  <Button className="font-headline text-xl tracking-wider border-2 border-foreground shadow-md">
                      <Download className="mr-2" />
                      My Resume
                  </Button>
              </Link>
              <div className="flex items-center space-x-4">
                  {SOCIAL_LINKS.map(social => (
                      <Link key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" aria-label={social.name} className="border-2 border-foreground hover:bg-primary/10">
                            <social.icon className="h-6 w-6" />
                        </Button>
                      </Link>
                  ))}
              </div>
          </AnimatedDiv>
        </div>
        <AnimatedDiv delay={400} className="relative hidden md:flex justify-center items-center">
            <div className="absolute bg-accent w-80 h-80 rounded-full blur-3xl opacity-30"></div>
            <div className="relative w-80 h-80 rounded-lg overflow-hidden border-4 border-foreground transform -rotate-6 transition-transform hover:rotate-0 hover:scale-105 shadow-2xl">
              <Image
                src="https://github.com/HakkanShah.png"
                alt="Hakkan Parbej Shah"
                width={320}
                height={320}
                className="object-cover w-full h-full"
                priority
              />
            </div>
        </AnimatedDiv>
      </div>
    </section>
  );
};

export default HeroSection;
