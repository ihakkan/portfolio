
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';
import type { Project } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onImageClick: (project: Project) => void;
}

const ProjectDetailsModal = ({ project, isOpen, onClose, onImageClick }: ProjectDetailsModalProps) => {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-0 border-4 border-foreground bg-background">
        <div className="flex flex-col md:flex-row">
          <div 
            className="md:w-1/2 relative aspect-video md:aspect-auto cursor-pointer"
            onClick={() => onImageClick(project)}
          >
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover md:rounded-l-lg"
              data-ai-hint={project.aiHint}
            />
          </div>
          <div className="md:w-1/2 p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl text-primary tracking-wider mb-2">{project.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-foreground overflow-y-auto max-h-[60vh] pr-2">
                <div>
                    <h4 className="font-bold text-accent font-headline tracking-wide text-lg mb-1">Description</h4>
                    <p className="text-sm leading-relaxed font-medium">{project.longDescription}</p>
                </div>
                <div>
                    <h4 className="font-bold text-accent font-headline tracking-wide text-lg mb-1">Why I Built This</h4>
                    <p className="text-sm italic leading-relaxed font-medium">{project.why}</p>
                </div>
                <div>
                    <h4 className="font-bold text-accent font-headline tracking-wide text-lg mb-1">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="border border-foreground/30">{tag}</Badge>
                        ))}
                    </div>
                </div>
            </div>
             <div className="flex gap-2 mt-auto pt-4">
                <Link href={project.liveUrl || '#'} target="_blank" passHref className='w-full'>
                    <Button variant="outline" className="w-full font-bold border-2 border-foreground" disabled={!project.liveUrl || project.liveUrl === '#'}>
                        <ExternalLink className="mr-2" /> Live Demo
                    </Button>
                </Link>
                <Link href={project.repoUrl || '#'} target="_blank" passHref className='w-full'>
                    <Button className="w-full font-bold border-2 border-foreground" disabled={!project.repoUrl || project.repoUrl === '#'}>
                        <Github className="mr-2" /> Repository
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;
