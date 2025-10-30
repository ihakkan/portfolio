
import { Award } from 'lucide-react';
import { CERTIFICATIONS } from '@/lib/data';
import { Card } from '@/components/ui/card';
import AnimatedDiv from './animated-div';
import Link from 'next/link';

const CertificationsSection = () => {
  return (
    <section id="certifications" className="section-padding">
      <div className="section-container">
        <AnimatedDiv className="text-center mb-12">
          <h2 className="font-headline text-5xl font-bold text-primary tracking-wider md:text-6xl">
            Certifications
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            My commitment to continuous learning and professional development.
          </p>
        </AnimatedDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CERTIFICATIONS.map((cert, index) => (
            <AnimatedDiv key={cert.name} delay={index * 100}>
                <Link href={cert.url} target="_blank" rel="noopener noreferrer" className='group'>
                    <Card className="p-4 h-full transition-transform transform group-hover:-translate-y-1 group-hover:shadow-xl dark:hover:shadow-primary/20 border-2 border-foreground">
                        <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-2 rounded-md border-2 border-foreground">
                            <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-md text-foreground group-hover:text-primary transition-colors">{cert.name}</h3>
                            <p className="text-sm text-muted-foreground">From: {cert.issuer}</p>
                        </div>
                        </div>
                    </Card>
              </Link>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
