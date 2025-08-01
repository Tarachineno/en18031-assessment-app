import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EvidenceFile } from '../types';

interface EvidenceState {
  files: EvidenceFile[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: { [fileId: string]: number };
  
  // Actions
  uploadFile: (file: File, assessmentId: string, description?: string) => Promise<EvidenceFile>;
  deleteFile: (id: string) => Promise<void>;
  updateFile: (id: string, updates: Partial<Pick<EvidenceFile, 'description' | 'tags'>>) => Promise<EvidenceFile>;
  getFile: (id: string) => EvidenceFile | undefined;
  getFilesByAssessment: (assessmentId: string) => EvidenceFile[];
  getFilesByType: (fileType: EvidenceFile['fileType']) => EvidenceFile[];
  searchFiles: (query: string) => EvidenceFile[];
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setUploadProgress: (fileId: string, progress: number) => void;
}

const generateId = () => crypto.randomUUID();
const getCurrentDateTime = () => new Date().toISOString();

const getFileType = (mimeType: string): EvidenceFile['fileType'] => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('text/') || mimeType.includes('log')) return 'log';
  if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('csv')) return 'data';
  return 'other';
};

const calculateChecksum = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useEvidenceStore = create<EvidenceState>()(
  persist(
    (set, get) => ({
      files: [],
      isLoading: false,
      error: null,
      uploadProgress: {},

      uploadFile: async (file: File, assessmentId: string, description?: string): Promise<EvidenceFile> => {
        const fileId = generateId();
        set({ isLoading: true, error: null });
        set(state => ({ uploadProgress: { ...state.uploadProgress, [fileId]: 0 } }));
        
        try {
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 50));
            set(state => ({ uploadProgress: { ...state.uploadProgress, [fileId]: progress } }));
          }

          const checksum = await calculateChecksum(file);
          const now = getCurrentDateTime();
          
          const newFile: EvidenceFile = {
            id: fileId,
            assessmentId,
            fileName: file.name,
            fileType: getFileType(file.type),
            fileSize: file.size,
            mimeType: file.type,
            description,
            uploadedAt: now,
            uploadedBy: 'current_user', // TODO: Get from auth context
            sharepointUrl: `mock://sharepoint/files/${fileId}`, // TODO: Implement actual SharePoint upload
            checksum,
            tags: [],
          };

          set(state => ({
            files: [...state.files, newFile],
            isLoading: false,
            uploadProgress: { ...state.uploadProgress, [fileId]: 100 },
          }));

          // Clean up progress after a delay
          setTimeout(() => {
            set(state => {
              const { [fileId]: _, ...remainingProgress } = state.uploadProgress;
              return { uploadProgress: remainingProgress };
            });
          }, 2000);

          return newFile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
          set(state => {
            const { [fileId]: _, ...remainingProgress } = state.uploadProgress;
            return { 
              error: errorMessage, 
              isLoading: false,
              uploadProgress: remainingProgress 
            };
          });
          throw error;
        }
      },

      deleteFile: async (id: string): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Delete from SharePoint
          set(state => ({
            files: state.files.filter(f => f.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateFile: async (id: string, updates: Partial<Pick<EvidenceFile, 'description' | 'tags'>>): Promise<EvidenceFile> => {
        set({ isLoading: true, error: null });
        
        try {
          const existingFile = get().files.find(f => f.id === id);
          if (!existingFile) {
            throw new Error('File not found');
          }

          const updatedFile: EvidenceFile = {
            ...existingFile,
            ...updates,
          };

          set(state => ({
            files: state.files.map(f => f.id === id ? updatedFile : f),
            isLoading: false,
          }));

          return updatedFile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update file';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      getFile: (id: string): EvidenceFile | undefined => {
        return get().files.find(f => f.id === id);
      },

      getFilesByAssessment: (assessmentId: string): EvidenceFile[] => {
        return get().files.filter(f => f.assessmentId === assessmentId);
      },

      getFilesByType: (fileType: EvidenceFile['fileType']): EvidenceFile[] => {
        return get().files.filter(f => f.fileType === fileType);
      },

      searchFiles: (query: string): EvidenceFile[] => {
        const lowerQuery = query.toLowerCase();
        return get().files.filter(file =>
          file.fileName.toLowerCase().includes(lowerQuery) ||
          file.description?.toLowerCase().includes(lowerQuery) ||
          file.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setUploadProgress: (fileId: string, progress: number) => {
        set(state => ({ uploadProgress: { ...state.uploadProgress, [fileId]: progress } }));
      },
    }),
    {
      name: 'evidence-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        files: state.files,
      }),
    }
  )
);