import { create } from 'zustand';
import {
  Store,
  InspectionTask,
  Product,
  PriceCheckRecord,
  PromotionCheckRecord,
  PhotoEvidence,
  RectificationItem,
  InspectionReport,
  User
} from '../types';
import {
  mockStores,
  mockTasks,
  mockProducts,
  mockPriceRecords,
  mockPromotionRecords,
  mockPhotos,
  mockRectifications,
  mockReports,
  mockUser
} from '../data/mockData';

const STORAGE_KEY = 'smart_retail_inspection_data';

interface PendingSyncIds {
  priceRecords: string[];
  promotionRecords: string[];
  photos: string[];
  rectifications: string[];
  [key: string]: string[];
}

interface AppState {
  user: User;
  stores: Store[];
  tasks: InspectionTask[];
  products: Product[];
  priceRecords: PriceCheckRecord[];
  promotionRecords: PromotionCheckRecord[];
  photos: PhotoEvidence[];
  rectifications: RectificationItem[];
  reports: InspectionReport[];
  currentTask: InspectionTask | null;
  currentStore: Store | null;
  isOffline: boolean;
  pendingSyncIds: PendingSyncIds;

  setCurrentTask: (task: InspectionTask | null) => void;
  setCurrentStore: (store: Store | null) => void;
  claimTask: (taskId: string, inspector: string) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
  addPriceRecord: (record: PriceCheckRecord) => void;
  addPromotionRecord: (record: PromotionCheckRecord) => void;
  addPhoto: (photo: PhotoEvidence) => void;
  addRectification: (rectification: RectificationItem) => void;
  updateRectification: (id: string, updates: Partial<RectificationItem>) => void;
  replyRectification: (id: string, content: string) => void;
  verifyRectification: (id: string, result: 'pass' | 'fail', remark: string) => void;
  addReport: (report: InspectionReport) => void;
  syncProducts: (products: Product[]) => void;
  setOffline: (offline: boolean) => void;
  syncAllData: () => Promise<boolean>;
  getPendingSyncCount: () => number;
  resetAllData: () => void;
}

const loadFromStorage = (): Partial<AppState> | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
  }
  return null;
};

const saveToStorage = (state: Partial<AppState>) => {
  try {
    const dataToSave = {
      priceRecords: state.priceRecords,
      promotionRecords: state.promotionRecords,
      photos: state.photos,
      rectifications: state.rectifications,
      reports: state.reports,
      tasks: state.tasks,
      isOffline: state.isOffline,
      pendingSyncIds: state.pendingSyncIds
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
};

const initialPendingSync: PendingSyncIds = {
  priceRecords: [],
  promotionRecords: [],
  photos: [],
  rectifications: []
};

const getInitialState = (): Partial<AppState> => {
  const stored = loadFromStorage();
  if (stored) {
    return {
      priceRecords: stored.priceRecords || mockPriceRecords,
      promotionRecords: stored.promotionRecords || mockPromotionRecords,
      photos: stored.photos || mockPhotos,
      rectifications: stored.rectifications || mockRectifications,
      reports: stored.reports || mockReports,
      tasks: stored.tasks || mockTasks,
      isOffline: stored.isOffline || false,
      pendingSyncIds: stored.pendingSyncIds || initialPendingSync
    };
  }
  return {};
};

const initialState = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  user: mockUser,
  stores: mockStores,
  tasks: initialState.tasks || mockTasks,
  products: mockProducts,
  priceRecords: initialState.priceRecords || mockPriceRecords,
  promotionRecords: initialState.promotionRecords || mockPromotionRecords,
  photos: initialState.photos || mockPhotos,
  rectifications: initialState.rectifications || mockRectifications,
  reports: initialState.reports || mockReports,
  currentTask: null,
  currentStore: null,
  isOffline: initialState.isOffline || false,
  pendingSyncIds: initialState.pendingSyncIds || initialPendingSync,

  setCurrentTask: (task) => set({ currentTask: task }),
  setCurrentStore: (store) => set({ currentStore: store }),

  claimTask: (taskId, inspector) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'in_progress', inspector } : t
      )
    }));
    saveToStorage(get());
  },

  updateTaskProgress: (taskId, progress) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, progress } : t
      )
    }));
    saveToStorage(get());
  },

  completeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      )
    }));
    saveToStorage(get());
  },

  addPriceRecord: (record) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    newPendingSync.priceRecords = [...newPendingSync.priceRecords, record.id];

    set({
      priceRecords: [...state.priceRecords, record],
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  addPromotionRecord: (record) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    newPendingSync.promotionRecords = [...newPendingSync.promotionRecords, record.id];

    set({
      promotionRecords: [...state.promotionRecords, record],
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  addPhoto: (photo) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    newPendingSync.photos = [...newPendingSync.photos, photo.id];

    set({
      photos: [...state.photos, photo],
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  addRectification: (rectification) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    newPendingSync.rectifications = [...newPendingSync.rectifications, rectification.id];

    set({
      rectifications: [...state.rectifications, rectification],
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  updateRectification: (id, updates) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    if (!newPendingSync.rectifications.includes(id)) {
      newPendingSync.rectifications = [...newPendingSync.rectifications, id];
    }

    set({
      rectifications: state.rectifications.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  replyRectification: (id, content) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    if (!newPendingSync.rectifications.includes(id)) {
      newPendingSync.rectifications = [...newPendingSync.rectifications, id];
    }

    set({
      rectifications: state.rectifications.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'replied',
              replyContent: content,
              replyTime: new Date().toLocaleString()
            }
          : r
      ),
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  verifyRectification: (id, result, remark) => {
    const state = get();
    const newPendingSync = { ...state.pendingSyncIds };
    if (!newPendingSync.rectifications.includes(id)) {
      newPendingSync.rectifications = [...newPendingSync.rectifications, id];
    }

    set({
      rectifications: state.rectifications.map((r) =>
        r.id === id
          ? {
              ...r,
              status: result === 'pass' ? 'verified' : 'processing',
              verifyResult: result,
              verifyRemark: remark,
              verifyTime: new Date().toLocaleString()
            }
          : r
      ),
      pendingSyncIds: newPendingSync
    });
    saveToStorage(get());
  },

  addReport: (report) => {
    set((state) => ({
      reports: [...state.reports, report]
    }));
    saveToStorage(get());
  },

  syncProducts: (products) => {
    set({ products });
    saveToStorage(get());
  },

  setOffline: (offline) => {
    set({ isOffline: offline });
    saveToStorage(get());
  },

  syncAllData: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const state = get();
    if (state.isOffline) {
      return false;
    }

    set({
      pendingSyncIds: {
        priceRecords: [],
        promotionRecords: [],
        photos: [],
        rectifications: []
      }
    });
    saveToStorage(get());
    return true;
  },

  getPendingSyncCount: () => {
    const state = get();
    const ids = state.pendingSyncIds;
    return (
      ids.priceRecords.length +
      ids.promotionRecords.length +
      ids.photos.length +
      ids.rectifications.length
    );
  },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      priceRecords: mockPriceRecords,
      promotionRecords: mockPromotionRecords,
      photos: mockPhotos,
      rectifications: mockRectifications,
      reports: mockReports,
      tasks: mockTasks,
      isOffline: false,
      pendingSyncIds: initialPendingSync
    });
  }
}));
