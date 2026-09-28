// Real-time Teacher Lab Monitoring Store

import { create } from 'zustand';

export interface StudentLiveTelemetry {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  sessionId: string;
  materialId: 'copper' | 'aluminium' | 'steel';
  materialName: string;
  voltage: number;
  current: number;
  power: number;
  waterFlowLmin: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  t5: number;
  t6: number;
  t7: number;
  t8: number;
  t9: number;
  steadyStateStatus: 'TRANSIENT' | 'APPROACHING_STEADY_STATE' | 'STEADY_STATE' | 'READY_TO_RECORD';
  lastUpdatedTime: string;
  isOnline: boolean;
}

const INITIAL_LIVE_STUDENTS: Record<string, StudentLiveTelemetry> = {
  'user-std-101': {
    studentId: 'user-std-101',
    studentName: 'Alex Rivera',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    sessionId: 'EXP-2026-00124',
    materialId: 'copper',
    materialName: 'Copper (Pure)',
    voltage: 8.0,
    current: 0.53,
    power: 4.27,
    waterFlowLmin: 1.5,
    t1: 62.5,
    t2: 55.1,
    t3: 48.0,
    t4: 41.2,
    t5: 34.9,
    t6: 28.8,
    t7: 23.1,
    t8: 20.0,
    t9: 21.8,
    steadyStateStatus: 'TRANSIENT',
    lastUpdatedTime: 'Just now',
    isOnline: true
  },
  'user-std-102': {
    studentId: 'user-std-102',
    studentName: 'Beatriz Santos',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    sessionId: 'EXP-2026-00125',
    materialId: 'steel',
    materialName: 'Stainless Steel (304)',
    voltage: 9.5,
    current: 0.63,
    power: 6.02,
    waterFlowLmin: 1.2,
    t1: 112.4,
    t2: 91.0,
    t3: 72.8,
    t4: 56.4,
    t5: 42.1,
    t6: 30.5,
    t7: 22.0,
    t8: 20.0,
    t9: 23.4,
    steadyStateStatus: 'STEADY_STATE',
    lastUpdatedTime: '1s ago',
    isOnline: true
  },
  'user-std-103': {
    studentId: 'user-std-103',
    studentName: 'Chen Wei',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    sessionId: 'EXP-2026-00126',
    materialId: 'aluminium',
    materialName: 'Aluminium Alloy (6061)',
    voltage: 7.2,
    current: 0.48,
    power: 3.46,
    waterFlowLmin: 1.8,
    t1: 51.2,
    t2: 44.8,
    t3: 39.1,
    t4: 33.7,
    t5: 28.9,
    t6: 24.6,
    t7: 21.0,
    t8: 20.0,
    t9: 21.2,
    steadyStateStatus: 'APPROACHING_STEADY_STATE',
    lastUpdatedTime: '2s ago',
    isOnline: true
  }
};

interface RealtimeMonitorState {
  liveStudents: Record<string, StudentLiveTelemetry>;
  updateStudentTelemetry: (studentId: string, telemetry: Partial<StudentLiveTelemetry>) => void;
  tickLiveSimulation: () => void;
}

export const useRealtimeMonitorStore = create<RealtimeMonitorState>((set, get) => ({
  liveStudents: INITIAL_LIVE_STUDENTS,

  updateStudentTelemetry: (studentId, telemetry) => {
    set((state) => ({
      liveStudents: {
        ...state.liveStudents,
        [studentId]: {
          ...state.liveStudents[studentId],
          ...telemetry,
          lastUpdatedTime: 'Just now',
          isOnline: true
        }
      }
    }));
  },

  // Simulates real-time minor thermal flux updates for background live students
  tickLiveSimulation: () => {
    const { liveStudents } = get();
    const updated = { ...liveStudents };
    
    Object.keys(updated).forEach((id) => {
      const s = updated[id];
      if (s.isOnline) {
        // Minor heat drift towards equilibrium
        const drift = (Math.random() - 0.48) * 0.15;
        updated[id] = {
          ...s,
          t1: Number(Math.max(20, s.t1 + drift * 0.8).toFixed(1)),
          t2: Number(Math.max(20, s.t2 + drift * 0.7).toFixed(1)),
          t3: Number(Math.max(20, s.t3 + drift * 0.6).toFixed(1)),
          t4: Number(Math.max(20, s.t4 + drift * 0.5).toFixed(1)),
          t5: Number(Math.max(20, s.t5 + drift * 0.4).toFixed(1)),
          t6: Number(Math.max(20, s.t6 + drift * 0.3).toFixed(1)),
          t7: Number(Math.max(20, s.t7 + drift * 0.2).toFixed(1)),
          t9: Number((s.t8 + (s.power * 0.4) / (s.waterFlowLmin * 4.18)).toFixed(1)),
          lastUpdatedTime: 'Just now'
        };
      }
    });

    set({ liveStudents: updated });
  }
}));
