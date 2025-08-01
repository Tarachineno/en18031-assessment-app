// Base types
export type DateTime = string; // ISO 8601 format

// Project related types
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  productName: string;
  manufacturer: string;
  modelReference: string;
  testStandard: string;
  testLaboratory: string;
  reportReference: string;
  assignees: string[];
  status: ProjectStatus;
  createdAt: DateTime;
  updatedAt: DateTime;
  createdBy: string;
  version: number;
}

// Test case related types
export type MechanismType = 
  | 'ACM' | 'AUM' | 'SUM' | 'SSM' | 'SCM' 
  | 'RLM' | 'NMM' | 'TCM' | 'CCK' | 'GEC' 
  | 'CRY' | 'LGM' | 'DLM' | 'UNM';

export type AssessmentType = 
  | 'conceptual' 
  | 'functional_completeness' 
  | 'functional_sufficiency';

export interface TestCase {
  id: string;
  mechanism: MechanismType;
  mechanismNumber: number;
  assessmentType: AssessmentType;
  title: string;
  objective: string;
  prerequisites: string;
  testProcedures: string;
  assessmentUnits: string;
  resultRationale: string;
  source: 'EN18031-1' | 'EN18031-2';
  section: string;
  order: number;
  testSteps: TestStep[];
}

export interface TestStep {
  id: string;
  testCaseId: string;
  stepNumber: number;
  assetId?: string;
  testingProcedure: string;
  expectedResult?: string;
  order: number;
}

// Assessment related types
export type AssessmentResult = 'pass' | 'fail' | 'na';

export interface Assessment {
  id: string;
  projectId: string;
  testCaseId: string;
  result: AssessmentResult;
  justification: string;
  comments?: string;
  testPerformedOn: string;
  testExecutedBy: string;
  evidenceFiles: string[];
  testStepResults: TestStepResult[];
  assessedAt: DateTime;
  assessedBy: string;
  version: number;
  status: 'draft' | 'completed' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: DateTime;
  notes?: string;
}

export interface TestStepResult {
  testStepId: string;
  result: AssessmentResult;
  actualResult: string;
  screenshots: string[];
  notes?: string;
}

// File related types
export type FileType = 
  | 'image'
  | 'log'
  | 'document'
  | 'data'
  | 'video'
  | 'other';

export interface EvidenceFile {
  id: string;
  assessmentId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedAt: DateTime;
  uploadedBy: string;
  sharepointUrl: string;
  thumbnailUrl?: string;
  checksum: string;
  tags: string[];
}

// User related types
export type UserRole = 'evaluator' | 'reviewer' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  preferences: UserPreferences;
  lastLoginAt?: DateTime;
  createdAt: DateTime;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ja';
  autoSaveInterval: number;
  defaultProjectView: 'grid' | 'list';
  emailNotifications: boolean;
}

// Progress tracking types
export interface ProjectProgress {
  projectId: string;
  overview: {
    total: number;
    completed: number;
    passed: number;
    failed: number;
    notApplicable: number;
    pending: number;
  };
  byMechanism: MechanismProgress[];
  byAssessmentType: AssessmentTypeProgress[];
  recentActivities: RecentActivity[];
  completionRate: number;
  estimatedCompletion?: DateTime;
}

export interface MechanismProgress {
  mechanism: MechanismType;
  total: number;
  completed: number;
  passed: number;
  failed: number;
  notApplicable: number;
}

export interface AssessmentTypeProgress {
  type: AssessmentType;
  total: number;
  completed: number;
  passed: number;
  failed: number;
  notApplicable: number;
}

export interface RecentActivity {
  type: 'assessment_created' | 'assessment_updated' | 'file_uploaded';
  testCaseId: string;
  testCaseName: string;
  timestamp: DateTime;
  user: string;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: DateTime;
}

// Form types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  productName: string;
  manufacturer: string;
  modelReference: string;
  testStandard: 'EN 18031-1' | 'EN 18031-2';
  testLaboratory: string;
  reportReference: string;
  assignees: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus;
}

export interface CreateAssessmentRequest {
  testCaseId: string;
  result: AssessmentResult;
  justification: string;
  comments?: string;
  testPerformedOn: string;
  testExecutedBy: string;
  testStepResults?: TestStepResult[];
}

export interface UpdateAssessmentRequest extends Partial<CreateAssessmentRequest> {
  status?: 'draft' | 'completed' | 'reviewed';
}

// Report types
export interface ReportConfig {
  type: 'complete' | 'summary' | 'failed_only' | 'custom';
  format: ('word' | 'pdf')[];
  sections: {
    executiveSummary: boolean;
    testResultsSummary: boolean;
    detailedResults: boolean;
    evidenceFiles: boolean;
    recommendations: boolean;
    appendices: boolean;
  };
  customOptions: {
    logoUrl?: string;
    title?: string;
    additionalNotes?: string;
  };
}