import { create } from 'zustand';
import { Defect, DefectStatus, DefectPriority, Room } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DefectsState {
  defects: Defect[];
  rooms: Room[];
  isLoading: boolean;

  // Actions
  addDefect: (defect: Omit<Defect, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDefect: (id: string, updates: Partial<Defect>) => void;
  deleteDefect: (id: string) => void;
  getDefectsByRoom: (roomId: string) => Defect[];
  getDefectsByProject: (projectId: string) => Defect[];
  loadDefects: () => Promise<void>;
  loadRooms: (projectId: string) => Promise<void>;
}

// Mock data for development
const generateMockRooms = (projectId: string): Room[] => {
  return [
    {
      id: 'room-1',
      projectId,
      name: 'Eingangsbereich',
      floor: 'EG',
      area: 25,
      description: 'Haupteingang mit Empfangsbereich',
    },
    {
      id: 'room-2',
      projectId,
      name: 'Büro 1',
      floor: 'EG',
      area: 35,
      description: 'Großraumbüro Erdgeschoss',
    },
    {
      id: 'room-3',
      projectId,
      name: 'Konferenzraum',
      floor: 'EG',
      area: 40,
      description: 'Konferenzraum mit Präsentationstechnik',
    },
    {
      id: 'room-4',
      projectId,
      name: 'Küche',
      floor: 'EG',
      area: 15,
      description: 'Gemeinschaftsküche',
    },
    {
      id: 'room-5',
      projectId,
      name: 'Toiletten EG',
      floor: 'EG',
      area: 12,
      description: 'WC-Anlagen Erdgeschoss',
    },
    {
      id: 'room-6',
      projectId,
      name: 'Büro 2',
      floor: '1. OG',
      area: 30,
      description: 'Einzelbüro erstes Obergeschoss',
    },
    {
      id: 'room-7',
      projectId,
      name: 'Lagerraum',
      floor: 'UG',
      area: 50,
      description: 'Lagerraum Untergeschoss',
    },
  ];
};

const generateMockDefects = (): Defect[] => {
  const now = new Date();

  return [
    {
      id: 'defect-1',
      projectId: '1',
      roomId: 'room-1',
      title: 'Riss in der Wand',
      description: 'Vertikaler Riss an der Ostwand, ca. 30cm lang',
      status: DefectStatus.OPEN,
      priority: DefectPriority.MEDIUM,
      createdBy: 'current-user-id',
      images: [],
      location: { x: 0.3, y: 0.5, floor: 'EG' },
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'defect-2',
      projectId: '1',
      roomId: 'room-2',
      title: 'Fußboden uneben',
      description: 'Boden im hinteren Bereich des Büros uneben, Stolpergefahr',
      status: DefectStatus.IN_PROGRESS,
      priority: DefectPriority.HIGH,
      assignedTo: 'worker-1',
      createdBy: 'current-user-id',
      images: [],
      location: { x: 0.7, y: 0.6, floor: 'EG' },
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'defect-3',
      projectId: '1',
      roomId: 'room-3',
      title: 'Feuchtigkeitsschaden Decke',
      description: 'Wasserflecken an der Decke, möglicherweise undichte Leitung',
      status: DefectStatus.OPEN,
      priority: DefectPriority.CRITICAL,
      createdBy: 'current-user-id',
      images: [],
      location: { x: 0.5, y: 0.8, floor: 'EG' },
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'defect-4',
      projectId: '1',
      roomId: 'room-4',
      title: 'Schranktür schließt nicht',
      description: 'Oberschrank-Tür rechts schließt nicht richtig, Scharnier defekt',
      status: DefectStatus.RESOLVED,
      priority: DefectPriority.LOW,
      assignedTo: 'worker-2',
      createdBy: 'current-user-id',
      images: [],
      location: { x: 0.8, y: 0.4, floor: 'EG' },
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'defect-5',
      projectId: '1',
      roomId: 'room-5',
      title: 'Wasserhahn tropft',
      description: 'Waschbecken links tropft kontinuierlich',
      status: DefectStatus.OPEN,
      priority: DefectPriority.MEDIUM,
      createdBy: 'current-user-id',
      images: [],
      location: { x: 0.2, y: 0.3, floor: 'EG' },
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  ];
};

export const useDefectsStore = create<DefectsState>((set, get) => ({
  defects: [],
  rooms: [],
  isLoading: false,

  addDefect: (defect) => {
    const { defects } = get();

    const newDefect: Defect = {
      ...defect,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newDefects = [newDefect, ...defects];
    set({ defects: newDefects });

    // Save to AsyncStorage
    AsyncStorage.setItem('defects', JSON.stringify(newDefects));
  },

  updateDefect: (id: string, updates: Partial<Defect>) => {
    const { defects } = get();

    const newDefects = defects.map((defect) =>
      defect.id === id
        ? { ...defect, ...updates, updatedAt: new Date() }
        : defect
    );

    set({ defects: newDefects });
    AsyncStorage.setItem('defects', JSON.stringify(newDefects));
  },

  deleteDefect: (id: string) => {
    const { defects } = get();
    const newDefects = defects.filter((defect) => defect.id !== id);

    set({ defects: newDefects });
    AsyncStorage.setItem('defects', JSON.stringify(newDefects));
  },

  getDefectsByRoom: (roomId: string) => {
    const { defects } = get();
    return defects.filter((defect) => defect.roomId === roomId);
  },

  getDefectsByProject: (projectId: string) => {
    const { defects } = get();
    return defects.filter((defect) => defect.projectId === projectId);
  },

  loadDefects: async () => {
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      const storedDefects = await AsyncStorage.getItem('defects');

      if (storedDefects) {
        const defects = JSON.parse(storedDefects);
        set({ defects });
      } else {
        // Use mock data for development
        const mockDefects = generateMockDefects();
        set({ defects: mockDefects });
        AsyncStorage.setItem('defects', JSON.stringify(mockDefects));
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Load defects error:', error);
      set({ isLoading: false });
    }
  },

  loadRooms: async (projectId: string) => {
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      const storedRooms = await AsyncStorage.getItem(`rooms_${projectId}`);

      if (storedRooms) {
        const rooms = JSON.parse(storedRooms);
        set({ rooms });
      } else {
        // Use mock data for development
        const mockRooms = generateMockRooms(projectId);
        set({ rooms: mockRooms });
        AsyncStorage.setItem(`rooms_${projectId}`, JSON.stringify(mockRooms));
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Load rooms error:', error);
      set({ isLoading: false });
    }
  },
}));
