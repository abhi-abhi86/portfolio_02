import React, { useEffect } from 'react';
import { Project } from '../types';
import { ExternalLink, Github } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-brand-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-accent/10 hover:-translate-y-2">
      
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300 z-10" />
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </div>

      {/* Content */}
      <div className="p-6 relative z-20 bg-zinc-900/90 backdrop-blur-sm h-full flex flex-col">
        <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-brand-glow transition-colors">
          {project.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-4 flex-grow">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-xs font-medium px-2.5 py-0.5 rounded bg-zinc-800 text-brand-glow border border-zinc-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4 mt-auto pt-4 border-t border-zinc-800">
          <a href={project.link} className="flex items-center gap-2 text-sm text-white hover:text-brand-accent transition-colors">
            <ExternalLink className="w-4 h-4" /> Live Demo
          </a>
          <a href="#" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <Github className="w-4 h-4" /> Code
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;