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
  pendingSyncData: any[];

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
}

export const useAppStore = create<AppState>((set) => ({
  user: mockUser,
  stores: mockStores,
  tasks: mockTasks,
  products: mockProducts,
  priceRecords: mockPriceRecords,
  promotionRecords: mockPromotionRecords,
  photos: mockPhotos,
  rectifications: mockRectifications,
  reports: mockReports,
  currentTask: null,
  currentStore: null,
  isOffline: false,
  pendingSyncData: [],

  setCurrentTask: (task) => set({ currentTask: task }),
  setCurrentStore: (store) => set({ currentStore: store }),

  claimTask: (taskId, inspector) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'in_progress', inspector } : t
      )
    })),

  updateTaskProgress: (taskId, progress) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, progress } : t
      )
    })),

  completeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
      )
    })),

  addPriceRecord: (record) =>
    set((state) => ({
      priceRecords: [...state.priceRecords, record]
    })),

  addPromotionRecord: (record) =>
    set((state) => ({
      promotionRecords: [...state.promotionRecords, record]
    })),

  addPhoto: (photo) =>
    set((state) => ({
      photos: [...state.photos, photo]
    })),

  addRectification: (rectification) =>
    set((state) => ({
      rectifications: [...state.rectifications, rectification]
    })),

  updateRectification: (id, updates) =>
    set((state) => ({
      rectifications: state.rectifications.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    })),

  replyRectification: (id, content) =>
    set((state) => ({
      rectifications: state.rectifications.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'replied',
              replyContent: content,
              replyTime: new Date().toLocaleString()
            }
          : r
      )
    })),

  verifyRectification: (id, result, remark) =>
    set((state) => ({
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
      )
    })),

  addReport: (report) =>
    set((state) => ({
      reports: [...state.reports, report]
    })),

  syncProducts: (products) =>
    set({ products }),

  setOffline: (offline) => set({ isOffline: offline })
}));
