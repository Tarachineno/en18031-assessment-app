import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal, Button } from '../common';
import { 
  exportAssessmentData, 
  importAssessmentData, 
  ExportFormat 
} from '../../utils/exportUtils';
import { 
  findDuplicateAssessments, 
  createDuplicateSummary 
} from '../../utils/duplicateDetection';
import { Project, Assessment, EvidenceFile, TestCase } from '../../types';
import { useProjectStore, useAssessmentStore, useEvidenceStore } from '../../stores';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  assessments: Assessment[];
  evidenceFiles: EvidenceFile[];
  testCases: TestCase[];
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  project,
  assessments,
  evidenceFiles,
  testCases
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [importFormat, setImportFormat] = useState<'json' | 'csv' | 'xml'>('json');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const { createProject } = useProjectStore();
  const { createAssessment, assessments: allAssessments } = useAssessmentStore();

  const exportFormats: { value: ExportFormat; label: string; description: string }[] = [
    { value: 'json', label: 'JSON', description: 'Complete project data with full structure' },
    { value: 'csv', label: 'CSV', description: 'Assessment data in spreadsheet format' },
    { value: 'xml', label: 'XML', description: 'Structured project data for integration' },
    { value: 'pdf', label: 'PDF', description: 'Professional report document' },
    { value: 'markdown', label: 'Markdown', description: 'Human-readable documentation' }
  ];

  const importFormats: { value: 'json' | 'csv' | 'xml'; label: string; description: string }[] = [
    { value: 'json', label: 'JSON', description: 'Import complete project data' },
    { value: 'csv', label: 'CSV', description: 'Import assessment data from spreadsheet' },
    { value: 'xml', label: 'XML', description: 'Import structured project data' }
  ];

  const handleExport = () => {
    try {
      exportAssessmentData(selectedFormat, project, assessments, evidenceFiles, testCases);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);
    setDuplicateWarning(null);

    try {
      const importedData = await importAssessmentData(file, importFormat);
      
      if (importFormat === 'json') {
        // Handle full project import
        if (importedData.project) {
          // Single project import
          const newProject = {
            ...importedData.project,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await createProject(newProject);

          // Import assessments for the new project with duplicate checking
          if (importedData.assessments) {
            const { duplicates, unique } = findDuplicateAssessments(
              importedData.assessments,
              allAssessments
            );
            
            if (duplicates.length > 0) {
              setDuplicateWarning(createDuplicateSummary(duplicates));
            }
            
            const assessmentsToImport = skipDuplicates ? unique : importedData.assessments;
            
            for (const assessment of assessmentsToImport) {
              await createAssessment({
                ...assessment,
                projectId: newProject.id
              }, newProject.id);
            }
          }

          setImportSuccess(`Successfully imported project "${newProject.name}" with ${importedData.assessments?.length || 0} assessments`);
        } else if (importedData.projects) {
          // Multiple projects import
          let importedCount = 0;
          for (const projectData of importedData.projects) {
            const newProject = {
              ...projectData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await createProject(newProject);
            importedCount++;
          }
          setImportSuccess(`Successfully imported ${importedCount} projects`);
        }
      } else if (importFormat === 'csv') {
        // Handle CSV assessment import with duplicate checking
        if (importedData.assessments) {
          const projectAssessments = importedData.assessments.filter(
            assessment => assessment.projectId === project.id
          );
          
          const { duplicates, unique } = findDuplicateAssessments(
            projectAssessments,
            allAssessments
          );
          
          if (duplicates.length > 0) {
            setDuplicateWarning(createDuplicateSummary(duplicates));
          }
          
          const assessmentsToImport = skipDuplicates ? unique : projectAssessments;
          let importedCount = 0;
          
          for (const assessment of assessmentsToImport) {
            await createAssessment({
              ...assessment,
              id: crypto.randomUUID(),
              assessedAt: new Date().toISOString()
            }, project.id);
            importedCount++;
          }
          
          setImportSuccess(`Successfully imported ${importedCount} assessments${duplicates.length > 0 && skipDuplicates ? ` (${duplicates.length} duplicates skipped)` : ''}`);
        }
      } else if (importFormat === 'xml') {
        // Handle XML import
        if (importedData.project) {
          const newProject = {
            ...importedData.project,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await createProject(newProject);

          if (importedData.assessments) {
            const { duplicates, unique } = findDuplicateAssessments(
              importedData.assessments,
              allAssessments
            );
            
            if (duplicates.length > 0) {
              setDuplicateWarning(createDuplicateSummary(duplicates));
            }
            
            const assessmentsToImport = skipDuplicates ? unique : importedData.assessments;
            
            for (const assessment of assessmentsToImport) {
              await createAssessment({
                ...assessment,
                projectId: newProject.id
              }, newProject.id);
            }
          }

          setImportSuccess(`Successfully imported project "${newProject.name}" from XML`);
        }
      }

    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml']
    },
    multiple: false
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import / Export Assessment Data">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Export Data
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Import Data
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Export "{project.name}" Assessment Data
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose a format to export your assessment data. Each format serves different purposes.
              </p>
            </div>

            <div className="space-y-3">
              {exportFormats.map((format) => (
                <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{format.label}</div>
                    <div className="text-sm text-gray-500">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                Export as {exportFormats.find(f => f.value === selectedFormat)?.label}
              </Button>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Import Assessment Data
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Import assessment data from various formats. Select the format that matches your file.
              </p>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Import Format</label>
              <div className="space-y-2">
                {importFormats.map((format) => (
                  <label key={format.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="importFormat"
                      value={format.value}
                      checked={importFormat === format.value}
                      onChange={(e) => setImportFormat(e.target.value as 'json' | 'csv' | 'xml')}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{format.label}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duplicate Handling Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Duplicate Handling</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Skip duplicate assessments</div>
                    <div className="text-sm text-gray-500">Automatically skip assessments with identical content</div>
                  </div>
                </label>
              </div>
            </div>

            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={isImporting} />
              {isImporting ? (
                <div className="space-y-2">
                  <div className="text-blue-600">📤</div>
                  <p className="text-sm text-gray-600">Importing...</p>
                </div>
              ) : isDragActive ? (
                <div className="space-y-2">
                  <div className="text-blue-600 text-2xl">📁</div>
                  <p className="text-sm text-gray-600">Drop your file here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400 text-2xl">📄</div>
                  <p className="text-sm text-gray-600">
                    Drag and drop a {importFormat.toUpperCase()} file here, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: .json, .csv, .xml
                  </p>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {importError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <div className="text-red-400 mr-3">❌</div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Import Error</h4>
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            {duplicateWarning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="text-yellow-400 mr-3">⚠️</div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Duplicate Assessments Detected</h4>
                    <p className="text-sm text-yellow-700 whitespace-pre-line">{duplicateWarning}</p>
                    {skipDuplicates && (
                      <p className="text-sm text-yellow-600 mt-1">These duplicates were automatically skipped.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {importSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <div className="text-green-400 mr-3">✅</div>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Import Successful</h4>
                    <p className="text-sm text-green-700">{importSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};