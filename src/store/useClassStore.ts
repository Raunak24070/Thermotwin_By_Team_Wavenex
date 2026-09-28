// ThermoTwin Classroom, Assignments & Results Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ClassRoom, 
  ExperimentAssignment, 
  ExperimentSubmissionResult, 
  UserProfile 
} from '../types/db';

export const SEED_CLASSES: ClassRoom[] = [];
export const SEED_ASSIGNMENTS: ExperimentAssignment[] = [];
export const SEED_STUDENTS: UserProfile[] = [];
export const SEED_SUBMISSIONS: ExperimentSubmissionResult[] = [];

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
      classes: [],
      assignments: [],
      submissions: [],
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
