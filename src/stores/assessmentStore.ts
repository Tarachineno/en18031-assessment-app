import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Assessment, CreateAssessmentRequest, UpdateAssessmentRequest, TestCase } from '../types';

interface AssessmentState {
  assessments: Assessment[];
  testCases: TestCase[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createAssessment: (data: CreateAssessmentRequest, projectId: string) => Promise<Assessment>;
  updateAssessment: (id: string, data: UpdateAssessmentRequest) => Promise<Assessment>;
  deleteAssessment: (id: string) => Promise<void>;
  getAssessment: (id: string) => Assessment | undefined;
  getAssessmentsByProject: (projectId: string) => Assessment[];
  getAssessmentsByTestCase: (testCaseId: string) => Assessment[];
  
  // Test case actions
  loadTestCases: (standard: 'EN18031-1' | 'EN18031-2') => Promise<void>;
  getTestCase: (id: string) => TestCase | undefined;
  getTestCasesByMechanism: (mechanism: string) => TestCase[];
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const generateId = () => crypto.randomUUID();
const getCurrentDateTime = () => new Date().toISOString();

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      assessments: [],
      testCases: [],
      isLoading: false,
      error: null,

      createAssessment: async (data: CreateAssessmentRequest, projectId: string): Promise<Assessment> => {
        set({ isLoading: true, error: null });
        
        try {
          const now = getCurrentDateTime();
          const newAssessment: Assessment = {
            id: generateId(),
            projectId,
            testCaseId: data.testCaseId,
            result: data.result,
            justification: data.justification,
            comments: data.comments,
            testPerformedOn: data.testPerformedOn,
            testExecutedBy: data.testExecutedBy,
            evidenceFiles: [],
            testStepResults: data.testStepResults || [],
            assessedAt: now,
            assessedBy: 'current_user', // TODO: Get from auth context
            version: 1,
            status: 'draft',
          };

          set(state => ({
            assessments: [...state.assessments, newAssessment],
            isLoading: false,
          }));

          return newAssessment;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateAssessment: async (id: string, data: UpdateAssessmentRequest): Promise<Assessment> => {
        set({ isLoading: true, error: null });
        
        try {
          const existingAssessment = get().assessments.find(a => a.id === id);
          if (!existingAssessment) {
            throw new Error('Assessment not found');
          }

          const updatedAssessment: Assessment = {
            ...existingAssessment,
            ...data,
            version: existingAssessment.version + 1,
          };

          set(state => ({
            assessments: state.assessments.map(a => a.id === id ? updatedAssessment : a),
            isLoading: false,
          }));

          return updatedAssessment;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update assessment';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteAssessment: async (id: string): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          set(state => ({
            assessments: state.assessments.filter(a => a.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete assessment';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getAssessment: (id: string): Assessment | undefined => {
        return get().assessments.find(a => a.id === id);
      },

      getAssessmentsByProject: (projectId: string): Assessment[] => {
        return get().assessments.filter(a => a.projectId === projectId);
      },

      getAssessmentsByTestCase: (testCaseId: string): Assessment[] => {
        return get().assessments.filter(a => a.testCaseId === testCaseId);
      },

      loadTestCases: async (standard: 'EN18031-1' | 'EN18031-2'): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          // Import test cases dynamically to avoid loading issues
          const { getTestCasesByStandard } = await import('../data/testCases');
          const loadedTestCases = getTestCasesByStandard(standard);

          set(state => ({
            testCases: [...state.testCases.filter(tc => tc.source !== standard), ...loadedTestCases],
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load test cases';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getTestCase: (id: string): TestCase | undefined => {
        return get().testCases.find(tc => tc.id === id);
      },

      getTestCasesByMechanism: (mechanism: string): TestCase[] => {
        return get().testCases.filter(tc => tc.mechanism === mechanism);
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'assessment-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assessments: state.assessments,
        testCases: state.testCases,
      }),
    }
  )
);