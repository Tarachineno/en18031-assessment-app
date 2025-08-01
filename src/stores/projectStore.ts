import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectProgress } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  setCurrentProject: (project: Project | null) => void;
  getProjectProgress: (id: string) => ProjectProgress | null;
  searchProjects: (query: string) => Project[];
  getProjectsByStatus: (status: Project['status']) => Project[];
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const generateId = () => crypto.randomUUID();
const getCurrentDateTime = () => new Date().toISOString();

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      createProject: async (data: CreateProjectRequest): Promise<Project> => {
        set({ isLoading: true, error: null });
        
        try {
          const now = getCurrentDateTime();
          const newProject: Project = {
            id: generateId(),
            ...data,
            status: 'draft',
            createdAt: now,
            updatedAt: now,
            createdBy: 'current_user', // TODO: Get from auth context
            version: 1,
          };

          set(state => ({
            projects: [...state.projects, newProject],
            isLoading: false,
          }));

          return newProject;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateProject: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
        set({ isLoading: true, error: null });
        
        try {
          const existingProject = get().projects.find(p => p.id === id);
          if (!existingProject) {
            throw new Error('Project not found');
          }

          const updatedProject: Project = {
            ...existingProject,
            ...data,
            updatedAt: getCurrentDateTime(),
            version: existingProject.version + 1,
          };

          set(state => ({
            projects: state.projects.map(p => p.id === id ? updatedProject : p),
            currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
            isLoading: false,
          }));

          return updatedProject;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      deleteProject: async (id: string): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getProject: (id: string): Project | undefined => {
        return get().projects.find(p => p.id === id);
      },

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },

      getProjectProgress: (id: string): ProjectProgress | null => {
        // TODO: Calculate actual progress from assessments
        const project = get().getProject(id);
        if (!project) return null;

        // Mock progress data for now
        return {
          projectId: id,
          overview: {
            total: 50,
            completed: 0,
            passed: 0,
            failed: 0,
            notApplicable: 0,
            pending: 50,
          },
          byMechanism: [],
          byAssessmentType: [],
          recentActivities: [],
          completionRate: 0,
        };
      },

      searchProjects: (query: string): Project[] => {
        const lowerQuery = query.toLowerCase();
        return get().projects.filter(project =>
          project.name.toLowerCase().includes(lowerQuery) ||
          project.description?.toLowerCase().includes(lowerQuery) ||
          project.productName.toLowerCase().includes(lowerQuery) ||
          project.manufacturer.toLowerCase().includes(lowerQuery)
        );
      },

      getProjectsByStatus: (status: Project['status']): Project[] => {
        return get().projects.filter(project => project.status === status);
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'project-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
);