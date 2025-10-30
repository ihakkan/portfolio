import { ABOUT_ME } from '@/lib/data';
import AnimatedDiv from './animated-div';

const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-accent/10 dark:bg-accent/5 border-y-4 border-foreground">
      <div className="section-container text-center">
        <AnimatedDiv className="relative max-w-4xl mx-auto p-8 bg-background rounded-lg border-4 border-foreground shadow-lg">
            <div className="absolute -top-6 -left-6 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg border-2 border-foreground transform -rotate-6">
                <h2 className="font-headline text-3xl tracking-wider">About Me</h2>
            </div>
            <p className="mt-6 text-lg text-foreground/90 leading-relaxed text-left">
              {ABOUT_ME}
            </p>
        </AnimatedDiv>
      </div>
    </section>
  );
};

export default AboutSection;
