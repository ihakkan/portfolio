import { SKILLS } from '@/lib/data';
import AnimatedDiv from './animated-div';
import AiToolIcon from './ai-tool-icon';

const SkillsSection = () => {
  return (
    <section id="skills" className="section-padding bg-muted/30 dark:bg-muted/10 border-y-4 border-foreground">
      <div className="section-container">
        <AnimatedDiv className="text-center mb-12">
          <h2 className="font-headline text-5xl font-bold text-primary tracking-wider md:text-6xl">
            My Arsenal
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Powers and tools I use to build amazing things.
          </p>
        </AnimatedDiv>

        <div className="space-y-12">
          {SKILLS.map((category, index) => (
            <AnimatedDiv key={category.name} delay={index * 100}>
              <h3 className="font-headline text-3xl text-accent tracking-wider mb-6 text-center">{category.name}</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {category.skills.map((skill: any) => {
                    const IconComponent = skill.icon;
                    return (
                        <div key={skill.name} className="flex flex-col items-center justify-center gap-2 text-center w-24 h-24 bg-background p-2 rounded-lg border-2 border-foreground shadow-md transition-transform hover:-translate-y-1">
                            {typeof IconComponent === 'string' && IconComponent === 'AiToolIcon' ? (
                                <AiToolIcon name={skill.shortName || skill.name} />
                            ) : (
                                <IconComponent className="h-8 w-8 text-foreground/80" />
                            )}
                            <span className="text-xs font-bold text-foreground">{skill.name}</span>
                        </div>
                    )
                })}
              </div>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
