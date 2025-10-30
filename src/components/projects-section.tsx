
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PROJECTS, type Project } from '@/lib/data';
import AnimatedDiv from './animated-div';
import { Eye } from 'lucide-react';
import ProjectDetailsModal from './project-details-modal';
import FullScreenImageModal from './full-screen-image-modal';

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullScreenProject, setFullScreenProject] = useState<Project | null>(null);

  const handleImageClick = (project: Project) => {
    setSelectedProject(null);
    setFullScreenProject(project);
  };

  return (
    <>
      <section id="projects" className="section-padding">
        <div className="section-container">
          <AnimatedDiv className="text-center mb-16">
            <h2 className="font-headline text-5xl font-bold text-primary tracking-wider md:text-6xl">
              My Projects
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              A selection of my work, from full-stack applications to fun experiments.
            </p>
          </AnimatedDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS.map((project, index) => (
              <AnimatedDiv key={project.title} delay={index * 100}>
                <div className="h-full flex flex-col overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-primary/20 bg-background border-4 border-foreground rounded-lg group">
                  <div 
                    className="relative aspect-video overflow-hidden cursor-pointer"
                    onClick={() => setFullScreenProject(project)}
                  >
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      className="object-cover border-b-4 border-foreground transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={project.aiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <h3 className="font-headline text-2xl text-white tracking-wide absolute bottom-2 left-4 p-2 drop-shadow-lg">
                      {project.title}
                    </h3>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-sm text-foreground/80 mt-2 flex-grow">{project.description}</p>
                    <div className="flex flex-wrap gap-2 my-4">
                      {project.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="border border-foreground/30">{tag}</Badge>
                      ))}
                      {project.tags.length > 3 && <Badge variant="outline">...</Badge>}
                    </div>
                    <div className="flex justify-end gap-2 mt-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-bold border-2 border-foreground"
                            onClick={() => setSelectedProject(project)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                        <Link href={project.liveUrl || '#'} target="_blank" passHref>
                            <Button size="sm" className="font-bold border-2 border-foreground" disabled={!project.liveUrl || project.liveUrl === '#'} >Live Demo</Button>
                        </Link>
                    </div>
                  </div>
                </div>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </section>
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onImageClick={handleImageClick}
      />
      <FullScreenImageModal 
        project={fullScreenProject}
        isOpen={!!fullScreenProject}
        onClose={() => setFullScreenProject(null)}
      />
    </>
  );
};

export default ProjectsSection;
