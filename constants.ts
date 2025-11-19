import { Project, Skill } from './types';

export const NAV_LINKS = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Personal Portfolio (Django)',
    description: 'A Django-based website to showcase projects, resume, and contact info, emphasizing clean architecture.',
    tags: ['Django', 'Python', 'HTML/CSS'],
    imageUrl: 'https://picsum.photos/800/600?random=10',
    link: 'https://github.com/abhi-abhi86'
  },
  {
    id: '2',
    title: 'Data Analysis & ML Experiments',
    description: 'Data cleaning workflows, model training, and evaluation scripts using the Scientific Python stack.',
    tags: ['Pandas', 'Scikit-learn', 'PyTorch', 'NumPy'],
    imageUrl: 'https://picsum.photos/800/600?random=11',
    link: 'https://github.com/abhi-abhi86/Multi-Species-Disease-Detection-and-Management-System.git'
  },
  {
    id: '3',
    title: 'GUI & Productivity Tools',
    description: 'Desktop utilities for image processing (Pillow), PDF generation (ReportLab), and productivity tools.',
    tags: ['PyQt6', 'Python', 'Pillow', 'ReportLab'],
    imageUrl: 'https://picsum.photos/800/600?random=12',
    link: 'https://github.com/abhi-abhi86'
  }
];

export const SKILLS: Skill[] = [
  { name: 'Python (Core)', level: 95, category: 'Development' },
  { name: 'NumPy / Pandas', level: 90, category: 'Data & ML' },
  { name: 'PyTorch', level: 75, category: 'Data & ML' },
  { name: 'MySQL / SQLite', level: 85, category: 'Database' },
  { name: 'PyQt6', level: 70, category: 'Development' },
  { name: 'Git / GitHub', level: 85, category: 'Tools' },
];

export const SYSTEM_INSTRUCTION = `You are an AI assistant for Abhishek M G's portfolio website. 
Abhishek is an aspiring Python Developer currently pursuing a Bachelor of Computer Applications (B.C.A).
He specializes in:
- Python (Automation, Scripting, GUIs)
- Data Science (Pandas, NumPy, Matplotlib)
- Machine Learning (Scikit-learn, PyTorch, Transformers)
- Databases (MySQL, SQLite)

Your goal is to answer questions about Abhishek's skills, projects, and experience professionally and concisely.
If asked about contact info, direct them to the contact form or email: abhishekmgabhishekmg726@gmail.com`;