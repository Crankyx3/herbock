import { create } from 'zustand';
import { Project, Room, ProjectStatus } from '../types';
import api from '../services/api';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setSelectedProject: (project: Project | null) => void;
  loadProjects: () => Promise<void>;
  loadProjectById: (id: string) => Promise<void>;
  createProject: (projectData: Omit<Project, 'id' | 'unreadMessages' | 'openDefects'>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('📦 Loading projects from backend...');
      const projects = await api.getProjects();

      // Transform dates from string to Date objects
      const transformedProjects = projects.map((project: any) => ({
        ...project,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        unreadMessages: 0, // TODO: Implement messages
        openDefects: project.open_defects_count || 0,
      }));

      set({ projects: transformedProjects, isLoading: false });
      console.log(`✅ Loaded ${transformedProjects.length} projects`);
    } catch (error) {
      console.error('❌ Load projects error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Laden der Projekte. Bitte Backend überprüfen.'
      });
    }
  },

  loadProjectById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Loading project ${id} from backend...`);
      const project = await api.getProjectById(id);

      // Load rooms for this project
      const rooms = await api.getRoomsByProject(id);

      // Transform dates and add rooms
      const transformedProject = {
        ...project,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        rooms: rooms,
        unreadMessages: 0, // TODO: Implement messages
        openDefects: project.defects?.length || 0,
      };

      set({ selectedProject: transformedProject, isLoading: false });
      console.log(`✅ Loaded project: ${transformedProject.name}`);
    } catch (error) {
      console.error('❌ Load project error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Laden des Projekts.'
      });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📦 Creating project...');
      const newProject = await api.createProject({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || ProjectStatus.ACTIVE,
        startDate: projectData.startDate.toISOString(),
        endDate: projectData.endDate?.toISOString(),
        floorPlanUrl: projectData.floorPlanUrl,
      });

      // Reload projects to get updated list
      await get().loadProjects();
      console.log('✅ Project created successfully');
    } catch (error) {
      console.error('❌ Create project error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Erstellen des Projekts.'
      });
      throw error;
    }
  },

  updateProject: async (id: string, projectData) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Updating project ${id}...`);
      await api.updateProject(id, {
        ...projectData,
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : undefined,
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : undefined,
      });

      // Reload projects to get updated list
      await get().loadProjects();
      console.log('✅ Project updated successfully');
    } catch (error) {
      console.error('❌ Update project error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Aktualisieren des Projekts.'
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Deleting project ${id}...`);
      await api.deleteProject(id);

      // Remove from local state
      const { projects } = get();
      set({
        projects: projects.filter(p => p.id !== id),
        isLoading: false
      });
      console.log('✅ Project deleted successfully');
    } catch (error) {
      console.error('❌ Delete project error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Löschen des Projekts.'
      });
      throw error;
    }
  },
}));
