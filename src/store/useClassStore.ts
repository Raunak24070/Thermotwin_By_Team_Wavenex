// ThermoTwin Classroom, Assignments & Results Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ClassRoom, 
  ExperimentAssignment, 
  ExperimentSubmissionResult, 
  UserProfile 
} from '../types/db';

export const SEED_CLASSES: ClassRoom[] = [
  {
    id: 'class-thermo-101',
    name: 'ME 302: Applied Heat Conduction Laboratory',
    code: 'THERMO-7K2P',
    teacherId: 'user-tch-201',
    teacherName: 'Dr. Marcus Vance',
    institution: 'Institute of Thermal Technology',
    createdDate: '2026-02-01',
    studentIds: ['user-std-101', 'user-std-102', 'user-std-103'],
    archived: false
  }
];

export const SEED_ASSIGNMENTS: ExperimentAssignment[] = [
  {
    id: 'assign-2026-01',
    classId: 'class-thermo-101',
    className: 'ME 302: Applied Heat Conduction Laboratory',
    teacherId: 'user-tch-201',
    title: 'Exp 01: Steady-State Thermal Conductivity of Pure Copper',
    experimentType: 'thermal_conductivity',
    instructions: 'Establish thermal steady state (|dT/dt| < 0.008 °C/s) with 8.0-10.0V heater and 1.5 L/min cooling. Log 3 observations and compute k using Fourier linear regression.',
    assignedDate: '2026-02-10',
    dueDate: '2026-03-31',
    maxAttempts: 3,
    requiredMaterial: 'copper',
    requiredVoltageRange: [6.0, 12.0],
    requiredFlowRange: [1.0, 2.5]
  }
];

export const SEED_SUBMISSIONS: ExperimentSubmissionResult[] = [
  {
    id: 'sub-sample-01',
    sessionId: 'EXP-2026-00125',
    studentId: 'user-std-102',
    studentName: 'Beatriz Santos',
    classId: 'class-thermo-101',
    materialId: 'steel',
    materialName: 'Stainless Steel (304)',
    voltage: 9.5,
    current: 0.63,
    power: 6.0,
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
    tempGradient: 301.3,
    heatInputW: 6.0,
    heatRemovedWaterW: 4.8,
    experimentalK: 48.9,
    referenceK: 50.2,
    absoluteError: 1.3,
    percentageError: 2.59,
    timeToSteadyStateSec: 740,
    observationCount: 3,
    mode: 'REAL_LAB',
    isCertifiedRealLab: true,
    gradeScore: 96,
    submittedAt: 'Today, 14:22',
    reviewStatus: 'REVIEWED',
    gradedBy: 'Dr. Marcus Vance',
    reviewedAt: 'Today, 15:05',
    teacherFeedback: 'Outstanding gradient regression analysis and precise steady-state capture.'
  }
];

interface ClassState {
  classes: ClassRoom[];
  assignments: ExperimentAssignment[];
  submissions: ExperimentSubmissionResult[];
  students: UserProfile[];
  
  // Methods
  createClass: (name: string, institution: string, teacherId: string, teacherName: string) => ClassRoom;
  joinClassByCode: (code: string, studentId: string) => boolean;
  createAssignment: (assignment: Omit<ExperimentAssignment, 'id' | 'assignedDate'>) => void;
  submitResult: (result: Omit<ExperimentSubmissionResult, 'id' | 'submittedAt' | 'reviewStatus'>) => void;
  addTeacherFeedback: (submissionId: string, feedback: string, teacherName: string) => void;
}

export const useClassStore = create<ClassState>()(
  persist(
    (set, get) => ({
      classes: SEED_CLASSES,
      assignments: SEED_ASSIGNMENTS,
      submissions: SEED_SUBMISSIONS,
      students: [],

      createClass: (name, institution, teacherId, teacherName) => {
        const code = `THERMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newClass: ClassRoom = {
          id: `class-${Date.now()}`,
          name,
          code,
          teacherId,
          teacherName,
          institution,
          createdDate: new Date().toISOString().split('T')[0],
          studentIds: [],
          archived: false
        };
        set((state) => ({ classes: [...state.classes, newClass] }));
        return newClass;
      },

      joinClassByCode: (code, studentId) => {
        const { classes } = get();
        const target = classes.find((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase());
        if (!target) return false;
        
        if (!target.studentIds.includes(studentId)) {
          const updatedClasses = classes.map((c) =>
            c.id === target.id ? { ...c, studentIds: [...c.studentIds, studentId] } : c
          );
          set({ classes: updatedClasses });
        }
        return true;
      },

      createAssignment: (newAssign) => {
        const fullAssignment: ExperimentAssignment = {
          ...newAssign,
          id: `assign-${Date.now()}`,
          assignedDate: new Date().toISOString().split('T')[0]
        };
        set((state) => ({ assignments: [...state.assignments, fullAssignment] }));
      },

      submitResult: (newSub) => {
        const fullResult: ExperimentSubmissionResult = {
          ...newSub,
          id: `sub-${Date.now()}`,
          submittedAt: new Date().toLocaleString(),
          reviewStatus: 'PENDING'
        };
        set((state) => ({
          submissions: [fullResult, ...state.submissions]
        }));
      },

      addTeacherFeedback: (submissionId, feedback, teacherName) => {
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  teacherFeedback: feedback,
                  gradedBy: teacherName,
                  reviewedAt: new Date().toLocaleString(),
                  reviewStatus: 'REVIEWED'
                }
              : sub
          )
        }));
      }
    }),
    {
      name: 'thermotwin-class-v2'
    }
  )
);
