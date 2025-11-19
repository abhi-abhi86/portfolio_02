import React from 'react';
import Navbar from './components/Navbar';
import HeroBackground from './components/HeroBackground';
import ProjectCard from './components/ProjectCard';
import AIChat from './components/AIChat';
import ScrollReveal from './components/ScrollReveal';
import Typewriter from './components/Typewriter';
import { PROJECTS, SKILLS } from './constants';
import { Github, Mail, ChevronDown, Terminal, Database, Cpu, Code2 } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-zinc-100 selection:bg-brand-primary selection:text-white font-sans overflow-x-hidden">
      <Navbar />
      <AIChat />

      {/* HERO SECTION */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />
        
        <div className="relative z-10 container mx-auto px-6 text-center -mt-12">
          <ScrollReveal>
            <div className="inline-block mb-4 px-3 py-1 rounded-full border border-brand-primary/30 bg-brand-primary/10 backdrop-blur-md">
              <span className="text-brand-primary text-xs md:text-sm font-medium tracking-wider uppercase">Available for hire</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tighter mb-6 text-white">
              Abhishek M G
            </h1>
            
            <div className="text-lg md:text-2xl text-zinc-400 mb-10 h-8 flex items-center justify-center gap-2 font-light">
              <span>I build</span>
              <span className="text-brand-glow font-semibold">
                <Typewriter 
                  words={['Python Applications', 'Data Pipelines', 'ML Models', 'Automation Scripts']} 
                  delay={80} 
                />
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <a 
                 href="#projects" 
                 className="px-8 py-3.5 bg-brand-primary hover:bg-blue-600 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
               >
                 View Work
               </a>
               <a 
                 href="#contact" 
                 className="px-8 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 backdrop-blur-sm text-white rounded-full font-medium transition-all hover:border-brand-primary/50"
               >
                 Contact Me
               </a>
            </div>
          </ScrollReveal>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-zinc-600">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-32 bg-zinc-950 relative">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
         
         <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-20 text-center text-white">
                About Me
              </h2>
            </ScrollReveal>
            
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <ScrollReveal delay={200}>
                <div className="space-y-8 text-zinc-400 leading-relaxed text-lg font-light">
                  <p className="text-xl text-zinc-200">
                    Hi! I'm <span className="text-brand-glow font-semibold">Abhishek</span>, an aspiring Python Developer currently pursuing my Bachelor of Computer Applications (B.C.A).
                  </p>
                  <p>
                    My journey involves building clean, maintainable, and scalable Python applications — from automation scripts and data pipelines to GUI apps and machine learning experiments.
                  </p>
                  <p>
                    I focus on efficient software design, readable code, and leveraging the power of the Python ecosystem (Pandas, PyTorch, PyQt6) to solve real-world problems.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid gap-6">
                 {SKILLS.map((skill, index) => (
                   <ScrollReveal key={skill.name} delay={300 + index * 100}>
                     <div className="group bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-2xl hover:bg-zinc-900/60 hover:border-brand-primary/30 transition-all duration-500">
                        <div className="flex items-center gap-5 mb-4">
                          <div className="p-3 bg-black rounded-xl text-brand-primary shadow-inner ring-1 ring-zinc-800 group-hover:text-brand-glow group-hover:ring-brand-primary/30 transition-all">
                            {skill.category === 'Development' && <Terminal className="w-5 h-5" />}
                            {skill.category === 'Data & ML' && <Cpu className="w-5 h-5" />}
                            {skill.category === 'Database' && <Database className="w-5 h-5" />}
                            {skill.category === 'Tools' && <Code2 className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-brand-accent transition-colors">{skill.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-glow transition-all duration-1000 ease-out transform origin-left scale-x-0 group-hover:scale-x-100"
                            style={{ width: `${skill.level}%`, transitionDelay: '100ms' }} 
                          />
                          {/* Static bar for visibility when not hovering */}
                          <div 
                             className="h-full bg-gradient-to-r from-brand-primary to-brand-glow absolute top-0 left-0 transition-all duration-1000 ease-out opacity-40"
                             style={{ width: `${skill.level}%` }}
                          />
                        </div>
                     </div>
                   </ScrollReveal>
                 ))}
              </div>
            </div>
         </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="py-32 bg-black relative">
        <div className="container mx-auto px-6">
           <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-20 text-center text-white">
                Featured Projects
              </h2>
           </ScrollReveal>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {PROJECTS.map((project, idx) => (
               <ScrollReveal key={project.id} delay={idx * 150}>
                 <ProjectCard project={project} />
               </ScrollReveal>
             ))}
           </div>
           
           <div className="mt-20 text-center">
              <a href="https://github.com/abhi-abhi86?tab=repositories" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all group border border-zinc-800 hover:border-brand-primary/30">
                <Github className="w-5 h-5 group-hover:text-brand-glow transition-colors" /> 
                <span>View all repositories</span>
              </a>
           </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-32 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 text-white">Let's Connect</h2>
            <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              I'm currently looking for opportunities to apply my skills in Python development and Data Science. Whether you have a question about my projects or just want to say hi, I'll try my best to get back to you!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
               <a href="mailto:abhishekmgabhishekmg726@gmail.com" className="flex items-center justify-center gap-3 px-8 py-4 bg-black border border-zinc-800 hover:border-brand-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] rounded-2xl transition-all group">
                 <Mail className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform" />
                 <span className="text-zinc-300 group-hover:text-white font-medium transition-colors">Email Me</span>
               </a>
               <a href="https://github.com/abhi-abhi86" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-8 py-4 bg-black border border-zinc-800 hover:border-white/20 hover:shadow-lg rounded-2xl transition-all group">
                 <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                 <span className="text-zinc-300 group-hover:text-white font-medium transition-colors">GitHub Profile</span>
               </a>
            </div>

            <footer className="text-zinc-600 text-sm">
              <p>© {new Date().getFullYear()} Abhishek M G. Built with React & Tailwind.</p>
            </footer>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

export default App;