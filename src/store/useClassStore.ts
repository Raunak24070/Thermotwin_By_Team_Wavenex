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
    name: 'ME 302 — Heat & Mass Transfer Lab',
    code: 'THERMO-7K2P',
    teacherId: 'user-tch-505',
    teacherName: 'Prof. David Vance',
    institution: 'Institute of Thermal Technology',
    createdDate: '2026-09-01',
    studentIds: ['user-std-101', 'user-std-102', 'user-std-103', 'user-std-104'],
    archived: false
  }
];

export const SEED_ASSIGNMENTS: ExperimentAssignment[] = [
  {
    id: 'assign-001',
    classId: 'class-thermo-101',
    className: 'ME 302 — Heat & Mass Transfer Lab',
    teacherId: 'user-tch-505',
    title: 'Determination of Thermal Conductivity of a Metallic Rod',
    experimentType: 'thermal_conductivity',
    instructions: 'Set heater voltage between 7V to 10V and cooling water flow to ~1.5 L/min. Wait for steady-state equilibrium (|dT/dt| < 0.008 °C/s) before recording observation table and calculating experimental thermal conductivity (k). Compare experimental value with reference properties.',
    assignedDate: '2026-09-10',
    dueDate: '2026-10-15',
    maxAttempts: 3,
    requiredMaterial: 'copper',
    requiredVoltageRange: [7, 10],
    requiredFlowRange: [1.2, 1.8]
  }
];

export const SEED_STUDENTS: UserProfile[] = [
  {
    id: 'user-std-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'STUDENT',
    institution: 'Institute of Thermal Technology',
    studentIdNumber: '2026-ME-042',
    classId: 'class-thermo-101'
  },
  {
    id: 'user-std-102',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@university.edu',
    role: 'STUDENT',
    institution: 'Institute of Thermal Technology',
    studentIdNumber: '2026-ME-019',
    classId: 'class-thermo-101'
  },
  {
    id: 'user-std-103',
    name: 'Chen Wei',
    email: 'chen.wei@university.edu',
    role: 'STUDENT',
    institution: 'Institute of Thermal Technology',
    studentIdNumber: '2026-ME-088',
    classId: 'class-thermo-101'
  },
  {
    id: 'user-std-104',
    name: 'Dimitri Kosta',
    email: 'dimitri.kosta@university.edu',
    role: 'STUDENT',
    institution: 'Institute of Thermal Technology',
    studentIdNumber: '2026-ME-105',
    classId: 'class-thermo-101'
  }
];

export const SEED_SUBMISSIONS: ExperimentSubmissionResult[] = [
  {
    id: 'sub-001',
    sessionId: 'EXP-2026-00088',
    submittedAt: '2026-09-24 14:32',
    studentId: 'user-std-102',
    studentName: 'Beatriz Santos',
    classId: 'class-thermo-101',
    materialId: 'copper',
    materialName: 'Copper (Pure)',
    voltage: 8.5,
    current: 0.57,
    power: 4.84,
    waterFlowLmin: 1.5,
    t1: 68.4,
    t2: 60.1,
    t3: 52.3,
    t4: 45.0,
    t5: 38.2,
    t6: 31.9,
    t7: 26.0,
    t8: 20.0,
    t9: 22.1,
    tempGradient: 141.33,
    heatInputW: 4.84,
    heatRemovedWaterW: 3.66,
    experimentalK: 378.2,
    referenceK: 385.0,
    absoluteError: 6.8,
    percentageError: 1.77,
    timeToSteadyStateSec: 184,
    observationCount: 8,
    mode: 'REAL_LAB',
    isCertifiedRealLab: true,
    gradeScore: 98,
    reviewStatus: 'REVIEWED',
    teacherFeedback: 'Excellent experimental execution! Temperature gradient was linear and energy balance accounted for thermal insulation loss.',
    gradedBy: 'Prof. David Vance',
    reviewedAt: '2026-09-25 09:15'
  },
  {
    id: 'sub-002',
    sessionId: 'EXP-2026-00092',
    submittedAt: '2026-09-25 11:10',
    studentId: 'user-std-103',
    studentName: 'Chen Wei',
    classId: 'class-thermo-101',
    materialId: 'aluminium',
    materialName: 'Aluminium Alloy (6061)',
    voltage: 9.0,
    current: 0.60,
    power: 5.4,
    waterFlowLmin: 1.4,
    t1: 72.1,
    t2: 62.4,
    t3: 53.1,
    t4: 44.2,
    t5: 35.8,
    t6: 28.1,
    t7: 21.3,
    t8: 20.0,
    t9: 22.8,
    tempGradient: 169.33,
    heatInputW: 5.4,
    heatRemovedWaterW: 4.56,
    experimentalK: 198.5,
    referenceK: 205.0,
    absoluteError: 6.5,
    percentageError: 3.17,
    timeToSteadyStateSec: 210,
    observationCount: 10,
    mode: 'REAL_LAB',
    isCertifiedRealLab: true,
    gradeScore: 94,
    reviewStatus: 'PENDING'
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
      students: SEED_STUDENTS,

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
      name: 'thermotwin-class-storage'
    }
  )
);
