import { create } from 'zustand';
import { TimeEntry, Project } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimeTrackingState {
  currentEntry: TimeEntry | null;
  entries: TimeEntry[];
  selectedProject: Project | null;
  isLoading: boolean;

  // Actions
  startTimer: (projectId: string, projectName: string, activity: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  addManualEntry: (entry: Omit<TimeEntry, 'id' | 'userId' | 'isRunning'>) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  setSelectedProject: (project: Project | null) => void;
  loadEntries: () => Promise<void>;
  getEntriesByDateRange: (startDate: Date, endDate: Date) => TimeEntry[];
  getTotalHoursForWeek: (weekStart: Date) => number;
}

// Mock data for development
const generateMockEntries = (): TimeEntry[] => {
  const now = new Date();
  const mockEntries: TimeEntry[] = [];

  // Generate entries for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const startTime = new Date(date.setHours(8, 0, 0, 0));
    const endTime = new Date(date.setHours(16, 30, 0, 0));
    const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60;

    mockEntries.push({
      id: `mock-${i}`,
      userId: 'current-user-id',
      projectId: i % 2 === 0 ? '1' : '2',
      activity: i % 2 === 0 ? 'Estrich schleifen' : 'Malerarbeiten',
      startTime,
      endTime,
      duration,
      isRunning: false,
    });
  }

  return mockEntries;
};

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  currentEntry: null,
  entries: [],
  selectedProject: null,
  isLoading: false,

  startTimer: (projectId: string, projectName: string, activity: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: 'current-user-id', // TODO: Get from auth
      projectId,
      activity,
      startTime: new Date(),
      isRunning: true,
    };

    set({ currentEntry: newEntry });

    // Save to AsyncStorage
    AsyncStorage.setItem('currentTimeEntry', JSON.stringify(newEntry));
  },

  stopTimer: () => {
    const { currentEntry, entries } = get();

    if (currentEntry) {
      const endTime = new Date();
      const duration = (endTime.getTime() - currentEntry.startTime.getTime()) / 1000 / 60 / 60; // hours

      const completedEntry: TimeEntry = {
        ...currentEntry,
        endTime,
        duration,
        isRunning: false,
      };

      const newEntries = [completedEntry, ...entries];

      set({
        currentEntry: null,
        entries: newEntries,
      });

      // Save to AsyncStorage
      AsyncStorage.removeItem('currentTimeEntry');
      AsyncStorage.setItem('timeEntries', JSON.stringify(newEntries));
    }
  },

  pauseTimer: () => {
    const { currentEntry } = get();

    if (currentEntry) {
      // Save current state as paused
      const pausedEntry = { ...currentEntry, isRunning: false };
      set({ currentEntry: pausedEntry });
      AsyncStorage.setItem('currentTimeEntry', JSON.stringify(pausedEntry));
    }
  },

  addManualEntry: (entry) => {
    const { entries } = get();

    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      userId: 'current-user-id',
      isRunning: false,
    };

    const newEntries = [newEntry, ...entries];
    set({ entries: newEntries });

    // Save to AsyncStorage
    AsyncStorage.setItem('timeEntries', JSON.stringify(newEntries));
  },

  deleteEntry: (id: string) => {
    const { entries } = get();
    const newEntries = entries.filter((entry) => entry.id !== id);

    set({ entries: newEntries });
    AsyncStorage.setItem('timeEntries', JSON.stringify(newEntries));
  },

  updateEntry: (id: string, updates: Partial<TimeEntry>) => {
    const { entries } = get();
    const newEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );

    set({ entries: newEntries });
    AsyncStorage.setItem('timeEntries', JSON.stringify(newEntries));
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  loadEntries: async () => {
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      // Load from AsyncStorage
      const storedEntries = await AsyncStorage.getItem('timeEntries');
      const currentEntry = await AsyncStorage.getItem('currentTimeEntry');

      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        set({ entries });
      } else {
        // Use mock data for development
        const mockEntries = generateMockEntries();
        set({ entries: mockEntries });
      }

      if (currentEntry) {
        set({ currentEntry: JSON.parse(currentEntry) });
      }

      set({ isLoading: false });
    } catch (error) {
      console.error('Load entries error:', error);
      set({ isLoading: false });
    }
  },

  getEntriesByDateRange: (startDate: Date, endDate: Date) => {
    const { entries } = get();

    return entries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startDate && entryDate <= endDate;
    });
  },

  getTotalHoursForWeek: (weekStart: Date) => {
    const { entries } = get();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return entries
      .filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= weekStart && entryDate < weekEnd && entry.duration;
      })
      .reduce((total, entry) => total + (entry.duration || 0), 0);
  },
}));
