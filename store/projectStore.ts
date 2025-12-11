import { create } from 'zustand';
import { Project, Room, ProjectStatus } from '../types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  setSelectedProject: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
}

// Mock rooms for example project
const mockRooms: Room[] = [
  {
    id: 'room-1',
    projectId: '1',
    name: 'Eingangsbereich',
    floor: 'EG',
    area: 25,
    description: 'Haupteingang mit Empfangsbereich',
  },
  {
    id: 'room-2',
    projectId: '1',
    name: 'Büro 1',
    floor: 'EG',
    area: 35,
    description: 'Großraumbüro Erdgeschoss',
  },
  {
    id: 'room-3',
    projectId: '1',
    name: 'Konferenzraum',
    floor: 'EG',
    area: 40,
    description: 'Konferenzraum mit Präsentationstechnik',
  },
  {
    id: 'room-4',
    projectId: '1',
    name: 'Küche',
    floor: 'EG',
    area: 15,
    description: 'Gemeinschaftsküche',
  },
  {
    id: 'room-5',
    projectId: '1',
    name: 'Toiletten EG',
    floor: 'EG',
    area: 12,
    description: 'WC-Anlagen Erdgeschoss',
  },
  {
    id: 'room-6',
    projectId: '1',
    name: 'Büro 2',
    floor: '1. OG',
    area: 30,
    description: 'Einzelbüro erstes Obergeschoss',
  },
  {
    id: 'room-7',
    projectId: '1',
    name: 'Lagerraum',
    floor: 'UG',
    area: 50,
    description: 'Lagerraum Untergeschoss',
  },
];

// Mock-Daten
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bauvorhaben Müller',
    description: 'Neubau Einfamilienhaus',
    status: ProjectStatus.ACTIVE,
    startDate: new Date('2024-01-15'),
    unreadMessages: 3,
    openDefects: 5,
    floorPlanUrl: 'grundrissplan.pdf',
    rooms: mockRooms,
  },
  {
    id: '2',
    name: 'Sanierung Altbau Schmidt',
    description: 'Komplettsanierung Mehrfamilienhaus',
    status: ProjectStatus.ACTIVE,
    startDate: new Date('2024-02-01'),
    unreadMessages: 0,
    openDefects: 2,
  },
  {
    id: '3',
    name: 'Gewerbepark Nord',
    description: 'Hallenbau mit Büroräumen',
    status: ProjectStatus.ACTIVE,
    startDate: new Date('2024-03-10'),
    unreadMessages: 1,
    openDefects: 1,
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
