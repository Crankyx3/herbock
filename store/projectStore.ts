import { create } from 'zustand';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  setSelectedProject: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
}

// Mock-Daten
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bauvorhaben Müller',
    description: 'Neubau Einfamilienhaus',
    status: 'ACTIVE',
    startDate: new Date('2024-01-15'),
    unreadMessages: 3,
    openDefects: 2,
  },
  {
    id: '2',
    name: 'Sanierung Altbau Schmidt',
    description: 'Komplettsanierung Mehrfamilienhaus',
    status: 'ACTIVE',
    startDate: new Date('2024-02-01'),
    unreadMessages: 0,
    openDefects: 5,
  },
  {
    id: '3',
    name: 'Gewerbepark Nord',
    description: 'Hallenbau mit Büroräumen',
    status: 'ACTIVE',
    startDate: new Date('2024-03-10'),
    unreadMessages: 1,
    openDefects: 0,
  },
];

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      set({ projects: mockProjects, isLoading: false });
    } catch (error) {
      console.error('Load projects error:', error);
      set({ isLoading: false });
    }
  },
}));
