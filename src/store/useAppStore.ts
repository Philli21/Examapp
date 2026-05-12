import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppState {
  stream: 'natural' | 'social' | null;
  subject: string | null;
  year: number | null;
  chapter: number | null;
  mode: 'practice' | 'exam';

  setStream: (stream: 'natural' | 'social' | null) => void;
  setSubject: (subject: string | null) => void;
  setYear: (year: number | null) => void;
  setChapter: (chapter: number | null) => void;
  setMode: (mode: 'practice' | 'exam') => void;
  resetFilters: () => void;
}

const initialState = {
  stream: null as 'natural' | 'social' | null,
  subject: null as string | null,
  year: null as number | null,
  chapter: null as number | null,
  mode: 'practice' as 'practice' | 'exam',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setStream: (stream) => set({ stream }),
      setSubject: (subject) => set({ subject }),
      setYear: (year) => set({ year }),
      setChapter: (chapter) => set({ chapter }),
      setMode: (mode) => set({ mode }),
      resetFilters: () => set(initialState),
    }),
    {
      name: 'examapp-filters',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { mode, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
