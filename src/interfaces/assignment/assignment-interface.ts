import {
  AnalysisResult,
  AnalysisStatus,
  IntegrityRisk,
} from "../analysis/analysis-interface";

export enum AssignmentType {
  TEXT = "text",
  FILE_UPLOAD = "file_upload",
  BOTH = "both",
}

// Add this interface to your assignment-interface.ts file

export interface SubmissionWithAnalysis extends Submission {
  analysis?: {
    status: AnalysisStatus;
    results: AnalysisResult[];
    summary?: {
      overallRisk: IntegrityRisk;
      confidence: number;
      isParaphrased: boolean;
      flaggedSections: number;
    };
  };
  student?: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  assignment?: {
    _id: string;
    title: string;
    maxScore: number;
    dueDate: string;
  };
}

export enum AssignmentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum SubmissionStatus {
  NOT_SUBMITTED = "not_submitted",
  SUBMITTED = "submitted",
  LATE = "late",
  GRADED = "graded",
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  courseId:
    | string
    | {
        _id: string;
        name: string;
        courseId: string;
      };
  facultyId: string;
  assignmentType: AssignmentType;
  maxScore: number;
  dueDate: string;
  allowLateSubmission: boolean;
  latePenalty?: number;
  attachmentFiles?: string[];
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  mySubmission?: StudentSubmission;
  settings?: AssignmentSettings;
}

export interface AssignmentWithDetails extends Assignment {
  course: {
    _id: string;
    name: string;
    courseId: string;
  };
  faculty: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  submissionCount: number;
  gradedCount: number;
  submissions?: SubmissionWithDetails[];
}

export interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  submissionFiles?: string[];
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionWithDetails extends Submission {
  assignment: {
    _id: string;
    title: string;
    maxScore: number;
    dueDate: string;
  };
  student: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  course?: {
    _id: string;
    name: string;
    courseId: string;
  };
}

// Request interfaces
export interface CreateAssignmentData {
  title: string;
  description: string;
  instructions?: string;
  courseId: string;
  assignmentType: AssignmentType;
  maxScore: number;
  dueDate: string;
  allowLateSubmission: boolean;
  latePenalty?: number;
  status: AssignmentStatus;
}

export interface UpdateAssignmentData {
  title?: string;
  description?: string;
  instructions?: string;
  assignmentType?: AssignmentType;
  maxScore?: number;
  dueDate?: string;
  allowLateSubmission?: boolean;
  latePenalty?: number;
  status?: AssignmentStatus;
}

export interface CreateSubmissionData {
  assignmentId: string;
  submissionText?: string;
  submissionFiles?: string[];
}

export interface GradeSubmissionData {
  grade: number;
  feedback?: string;
}

// Response interfaces
export interface AssignmentResponse {
  assignments: AssignmentWithDetails[];
}

export interface SingleAssignmentResponse {
  assignment: AssignmentWithDetails;
}

export interface SubmissionResponse {
  submissions: SubmissionWithDetails[];
}

export interface SingleSubmissionResponse {
  submission: SubmissionWithDetails;
}

export interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  draftAssignments: number;
  archivedAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingGrading: number;
  averageGrade: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}

export interface StudentSubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  submissionFiles?: string[];
  submittedAt: string;
  isLate: boolean;
  grade?: number;
  feedback?: string;
  status: "not_submitted" | "submitted" | "late" | "graded";
  createdAt: string;
  updatedAt: string;
  assignment?: {
    _id: string;
    title: string;
    maxScore: number;
    dueDate: string;
  };
}

export interface StudentAnalytics {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  gradedAssignments: number;
  overdueAssignments: number;
  averageGrade: number;
  upcomingDeadlines: Assignment[];
  recentSubmissions: StudentSubmission[];

  totalAnalyzed?: number;
  flaggedSubmissions?: number;
  averageIntegrityScore?: number;
  paraphrasingIncidents?: number;
}

export interface StudentAssignmentAnalytics {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  gradedAssignments: number;
  averageGrade: number;
  upcomingDeadlines: Assignment[];
  recentSubmissions: StudentSubmission[];
}

export interface AssignmentSettings {
  allowMultipleSubmissions: boolean;
  showScoreToStudents: boolean;
  enablePeerReview: boolean;
  autoGrading: boolean;
  plagiarismCheck: boolean;
  aiAnalysisEnabled: boolean;
  analysisTypes: string[];
}
