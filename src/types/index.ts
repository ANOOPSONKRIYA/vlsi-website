// Project Types
export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: 'vlsi' | 'ai-robotics' | 'research';
  thumbnail: string;
  images: string[];
  videos: Video[];
  techStack: string[];
  timeline: TimelineEvent[];
  teamMembers: string[]; // Array of team member IDs
  status: 'ongoing' | 'completed';
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  documentationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  description?: string;
  type: 'youtube' | 'vimeo' | 'direct';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  milestone: boolean;
}

// Team Member Types
export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  socialLinks: SocialLink[];
  skills: string[];
  projects: string[]; // Array of project IDs
  resume: Resume;
  education: Education[];
  experience: Experience[];
  achievements: Achievement[];
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'email';
  url: string;
}

export interface Resume {
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
  current: boolean;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  link?: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
  lastLogin: string;
  createdAt: string;
}

// About Page Types
export interface AboutData {
  id: string;
  mission: string;
  vision: string;
  description: string;
  stats: Stat[];
  history: HistoryEvent[];
  facilities: Facility[];
  partners: Partner[];
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface HistoryEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

// Form Types
export interface ProjectFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: 'vlsi' | 'ai-robotics' | 'research';
  techStack: string[];
  status: 'ongoing' | 'completed';
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export interface TeamMemberFormData {
  name: string;
  role: string;
  email: string;
  phone?: string;
  bio: string;
  skills: string[];
  isActive: boolean;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

// Animation Types
export interface AOSConfig {
  duration?: number;
  easing?: string;
  once?: boolean;
  mirror?: boolean;
  anchorPlacement?: string;
}
