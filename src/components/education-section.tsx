import { GraduationCap } from 'lucide-react';
import { EDUCATION } from '@/lib/data';
import AnimatedDiv from './animated-div';

const EducationSection = () => {
  return (
    <section id="education" className="section-padding bg-accent/10 dark:bg-accent/5">
      <div className="section-container">
        <AnimatedDiv className="text-center mb-12">
          <h2 className="font-headline text-5xl font-bold text-primary tracking-wider md:text-6xl">
            My Origin Story
          </h2>
        </AnimatedDiv>
        <div className="max-w-4xl mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-foreground/30 before:md:mx-auto md:before:translate-x-0">
          {EDUCATION.map((edu, index) => (
            <AnimatedDiv key={edu.degree} delay={index * 150} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary border-2 border-foreground text-primary-foreground shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-4 rounded-lg border-2 border-foreground shadow-md">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <h3 className="font-bold text-lg text-primary">{edu.degree}</h3>
                  <p className="font-semibold text-sm text-muted-foreground">{edu.period}</p>
                </div>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <p className="text-sm font-bold mt-1">{edu.details}</p>
              </div>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
