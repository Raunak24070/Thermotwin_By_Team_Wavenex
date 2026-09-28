// ThermoTwin Platform Database & Application Domain Types

export type UserRole = 'STUDENT' | 'TEACHER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  avatarUrl?: string;
  classId?: string;
  studentIdNumber?: string;
  teacherIdNumber?: string;
  bio?: string;
  department?: string;
  joinedDate?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string; // e.g. THERMO-7K2P
  teacherId: string;
  teacherName: string;
  institution: string;
  createdDate: string;
  studentIds: string[];
  archived: boolean;
}

export interface ExperimentAssignment {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  title: string;
  experimentType: 'thermal_conductivity';
  instructions: string;
  assignedDate: string;
  dueDate: string;
  maxAttempts: number;
  requiredMaterial?: 'copper' | 'aluminium' | 'steel';
  requiredVoltageRange?: [number, number];
  requiredFlowRange?: [number, number];
}

export type SessionStatus = 
  | 'CREATED'
  | 'STARTED'
  | 'IN_PROGRESS'
  | 'STEADY_STATE'
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'ABANDONED';

export interface ExperimentSession {
  id: string; // e.g. EXP-2026-001245
  assignmentId: string;
  studentId: string;
  studentName: string;
  classId: string;
  attemptNumber: number;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  
  // Active state snapshot
  materialId: 'copper' | 'aluminium' | 'steel';
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
  steadyStateStatus: string;
  calculatedK: number | null;
  
  // Activity Event Stream
  events: ExperimentEvent[];
  
  // Student Table Observations
  observations: SessionObservationRow[];
  
  // Submission Payload (populated when status = SUBMITTED)
  result?: ExperimentSubmissionResult;
}

export interface SessionObservationRow {
  id: string;
  sampleTimeSeconds: number;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  flowRate: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  t5: number;
  t6: number;
  t7: number;
  t8: number;
  t9: number;
  dTdx: number;
  calculatedK: number | null;
  steadyState: string;
}

export interface ExperimentEvent {
  id: string;
  timestamp: string;
  eventType: 
    | 'EXPERIMENT_STARTED'
    | 'EXPERIMENT_PAUSED'
    | 'EXPERIMENT_STOPPED'
    | 'SIMULATION_SPEED_CHANGED'
    | 'MATERIAL_CHANGED'
    | 'HEATER_VOLTAGE_CHANGED'
    | 'WATER_FLOW_CHANGED'
    | 'SENSOR_INSPECTED'
    | 'VIEW_MODE_CHANGED'
    | 'OBSERVATION_RECORDED'
    | 'STEADY_STATE_ACHIEVED'
    | 'EXPERIMENT_SUBMITTED';
  details: string;
}

export interface ExperimentSubmissionResult {
  id: string;
  sessionId: string;
  submittedAt: string;
  studentId: string;
  studentName: string;
  classId: string;
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
  
  tempGradient: number;
  heatInputW: number;
  heatRemovedWaterW: number;
  experimentalK: number;
  referenceK: number;
  absoluteError: number;
  percentageError: number;
  timeToSteadyStateSec: number;
  
  observationCount: number;
  
  // Submission Mode & Certification
  mode: 'DEMO' | 'REAL_LAB';
  isCertifiedRealLab?: boolean;
  gradeScore?: number;
  
  // Target Faculty / Routing
  targetTeacherId?: string;
  targetTeacherEmail?: string;
  targetClassCode?: string;

  // Review Status
  reviewStatus: 'PENDING' | 'REVIEWED';
  teacherFeedback?: string;
  gradedBy?: string;
  reviewedAt?: string;
}
