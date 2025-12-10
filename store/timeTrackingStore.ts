import { create } from 'zustand';
import { TimeEntry, Project } from '../types';

interface TimeTrackingState {
  currentEntry: TimeEntry | null;
  entries: TimeEntry[];
  selectedProject: Project | null;
  startTimer: (projectId: string, activity: string) => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  setSelectedProject: (project: Project | null) => void;
  loadEntries: () => Promise<void>;
}

export const useTimeTrackingStore = create<TimeTrackingState>((set, get) => ({
  currentEntry: null,
  entries: [],
  selectedProject: null,

  startTimer: (projectId: string, activity: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: 'current-user-id', // TODO: Get from auth
      projectId,
      activity,
      startTime: new Date(),
      isRunning: true,
    };

    set({ currentEntry: newEntry });
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

      set({
        currentEntry: null,
        entries: [completedEntry, ...entries],
      });
    }
  },

  pauseTimer: () => {
    // TODO: Implement pause functionality
    console.log('Pause timer');
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  loadEntries: async () => {
    // TODO: Implement API call
    try {
      // Mock data
      set({ entries: [] });
    } catch (error) {
      console.error('Load entries error:', error);
    }
  },
}));
