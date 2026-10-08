import { create } from 'zustand';
import { experimentApi, SavedExperiment } from '../api/apiClient';

interface ExperimentState {
  experiments: SavedExperiment[];
  activeExperiment: SavedExperiment | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  fetchExperiments: () => Promise<void>;
  fetchExperimentById: (id: string) => Promise<SavedExperiment | null>;
  saveCurrentExperiment: (payload: Partial<SavedExperiment>) => Promise<{ success: boolean; data?: SavedExperiment; message?: string }>;
  deleteExperiment: (id: string) => Promise<{ success: boolean; message?: string }>;
  clearMessages: () => void;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  experiments: [],
  activeExperiment: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchExperiments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await experimentApi.getAll();
      if (res && res.data) {
        set({ experiments: res.data, isLoading: false });
      } else {
        set({ experiments: [], isLoading: false });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch saved experiments.',
        isLoading: false
      });
    }
  },

  fetchExperimentById: async (id: string) => {
    set({ isLoading: true, error: null, activeExperiment: null });
    try {
      const res = await experimentApi.getById(id);
      if (res && res.data) {
        set({ activeExperiment: res.data, isLoading: false });
        return res.data;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || 'Failed to fetch experiment details.',
        isLoading: false
      });
      return null;
    }
  },

  saveCurrentExperiment: async (payload: Partial<SavedExperiment>) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const res = await experimentApi.create(payload);
      if (res && res.success && res.data) {
        // Prepend to current list
        const updated = [res.data, ...get().experiments];
        set({
          experiments: updated,
          activeExperiment: res.data,
          isSaving: false,
          successMessage: 'Experiment snapshot saved to MongoDB successfully!'
        });
        return { success: true, data: res.data, message: res.message };
      }
      set({ isSaving: false });
      return { success: false, message: 'Failed to save experiment.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error saving experiment to MongoDB.';
      set({ isSaving: false, error: msg });
      return { success: false, message: msg };
    }
  },

  deleteExperiment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await experimentApi.delete(id);
      if (res && res.success) {
        set({
          experiments: get().experiments.filter((exp) => exp._id !== id && exp.id !== id),
          isLoading: false,
          successMessage: 'Experiment deleted successfully.'
        });
        return { success: true, message: res.message };
      }
      set({ isLoading: false });
      return { success: false, message: 'Failed to delete experiment.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete experiment.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  clearMessages: () => set({ error: null, successMessage: null })
}));
