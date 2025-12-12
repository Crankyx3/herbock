import { create } from 'zustand';
import { Defect, DefectStatus, DefectPriority, Room } from '../types';
import api from '../services/api';

interface DefectsState {
  defects: Defect[];
  rooms: Room[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addDefect: (defect: Omit<Defect, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDefect: (id: string, updates: Partial<Defect>) => Promise<void>;
  deleteDefect: (id: string) => Promise<void>;
  getDefectsByRoom: (roomId: string) => Defect[];
  getDefectsByProject: (projectId: string) => Defect[];
  loadDefects: (projectId: string) => Promise<void>;
  loadRooms: (projectId: string) => Promise<void>;
}

export const useDefectsStore = create<DefectsState>((set, get) => ({
  defects: [],
  rooms: [],
  isLoading: false,
  error: null,

  addDefect: async (defect) => {
    set({ isLoading: true, error: null });
    try {
      console.log('📦 Creating defect...');
      const newDefect = await api.createDefect({
        projectId: defect.projectId,
        roomId: defect.roomId,
        title: defect.title,
        description: defect.description,
        originalDescription: defect.originalDescription,
        originalLanguage: defect.originalLanguage,
        priority: defect.priority || DefectPriority.MEDIUM,
        status: defect.status || DefectStatus.OPEN,
        assignedToId: defect.assignedTo,
        location: defect.location,
        images: defect.images || [],
        audioUrl: defect.audioUrl,
      });

      // Transform and add to local state
      const transformedDefect = {
        ...newDefect,
        createdAt: new Date(newDefect.createdAt),
        updatedAt: new Date(newDefect.updatedAt),
      };

      const { defects } = get();
      set({
        defects: [transformedDefect, ...defects],
        isLoading: false
      });
      console.log('✅ Defect created successfully');
    } catch (error) {
      console.error('❌ Create defect error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Erstellen des Mangels.'
      });
      throw error;
    }
  },

  updateDefect: async (id: string, updates: Partial<Defect>) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Updating defect ${id}...`);
      await api.updateDefect(id, {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        assignedToId: updates.assignedTo,
        location: updates.location,
        images: updates.images,
        audioUrl: updates.audioUrl,
      });

      // Update local state
      const { defects } = get();
      const newDefects = defects.map((defect) =>
        defect.id === id
          ? { ...defect, ...updates, updatedAt: new Date() }
          : defect
      );

      set({ defects: newDefects, isLoading: false });
      console.log('✅ Defect updated successfully');
    } catch (error) {
      console.error('❌ Update defect error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Aktualisieren des Mangels.'
      });
      throw error;
    }
  },

  deleteDefect: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Deleting defect ${id}...`);
      await api.deleteDefect(id);

      // Remove from local state
      const { defects } = get();
      set({
        defects: defects.filter((defect) => defect.id !== id),
        isLoading: false
      });
      console.log('✅ Defect deleted successfully');
    } catch (error) {
      console.error('❌ Delete defect error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Löschen des Mangels.'
      });
      throw error;
    }
  },

  getDefectsByRoom: (roomId: string) => {
    const { defects } = get();
    return defects.filter((defect) => defect.roomId === roomId);
  },

  getDefectsByProject: (projectId: string) => {
    const { defects } = get();
    return defects.filter((defect) => defect.projectId === projectId);
  },

  loadDefects: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Loading defects for project ${projectId}...`);
      const defects = await api.getDefectsByProject(projectId);

      // Transform dates
      const transformedDefects = defects.map((defect: any) => ({
        ...defect,
        createdAt: new Date(defect.createdAt),
        updatedAt: new Date(defect.updatedAt),
      }));

      set({ defects: transformedDefects, isLoading: false });
      console.log(`✅ Loaded ${transformedDefects.length} defects`);
    } catch (error) {
      console.error('❌ Load defects error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Laden der Mängel. Bitte Backend überprüfen.'
      });
    }
  },

  loadRooms: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`📦 Loading rooms for project ${projectId}...`);
      const rooms = await api.getRoomsByProject(projectId);

      set({ rooms, isLoading: false });
      console.log(`✅ Loaded ${rooms.length} rooms`);
    } catch (error) {
      console.error('❌ Load rooms error:', error);
      set({
        isLoading: false,
        error: 'Fehler beim Laden der Räume. Bitte Backend überprüfen.'
      });
    }
  },
}));
