import { Project, Assessment, EvidenceFile } from '../types';

interface ExportData {
  projects: Project[];
  assessments: Assessment[];
  evidenceFiles: EvidenceFile[];
  exportedAt: string;
  version: string;
}

export const exportProjectData = (
  projects: Project[],
  assessments: Assessment[],
  evidenceFiles: EvidenceFile[]
): void => {
  const exportData: ExportData = {
    projects,
    assessments,
    evidenceFiles,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `en18031-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportSingleProject = (
  project: Project,
  assessments: Assessment[],
  evidenceFiles: EvidenceFile[]
): void => {
  const projectAssessments = assessments.filter(a => a.projectId === project.id);
  const projectEvidenceFiles = evidenceFiles.filter(f => 
    projectAssessments.some(a => a.id === f.assessmentId)
  );

  const exportData = {
    project,
    assessments: projectAssessments,
    evidenceFiles: projectEvidenceFiles,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importProjectData = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!data.projects || !Array.isArray(data.projects)) {
          throw new Error('Invalid export file: missing or invalid projects data');
        }
        
        if (!data.assessments || !Array.isArray(data.assessments)) {
          throw new Error('Invalid export file: missing or invalid assessments data');
        }
        
        if (!data.evidenceFiles || !Array.isArray(data.evidenceFiles)) {
          throw new Error('Invalid export file: missing or invalid evidence files data');
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const generateProjectReport = (
  project: Project,
  assessments: Assessment[]
): void => {
  const projectAssessments = assessments.filter(a => a.projectId === project.id);
  
  const passedCount = projectAssessments.filter(a => a.result === 'pass').length;
  const failedCount = projectAssessments.filter(a => a.result === 'fail').length;
  const naCount = projectAssessments.filter(a => a.result === 'na').length;
  
  const reportContent = `
# EN 18031 Assessment Report

## Project Information
- **Project Name:** ${project.name}
- **Product Name:** ${project.productName}
- **Manufacturer:** ${project.manufacturer}
- **Model Reference:** ${project.modelReference}
- **Test Standard:** ${project.testStandard}
- **Test Laboratory:** ${project.testLaboratory}
- **Report Reference:** ${project.reportReference}
- **Created:** ${new Date(project.createdAt).toLocaleDateString()}
- **Last Updated:** ${new Date(project.updatedAt).toLocaleDateString()}

## Assessment Summary
- **Total Assessments:** ${projectAssessments.length}
- **Passed:** ${passedCount}
- **Failed:** ${failedCount}
- **Not Applicable:** ${naCount}
- **Completion Rate:** ${projectAssessments.length > 0 ? Math.round((passedCount + failedCount + naCount) / projectAssessments.length * 100) : 0}%

## Assessment Details
${projectAssessments.map(assessment => `
### Assessment ${assessment.id}
- **Test Case:** ${assessment.testCaseId}
- **Result:** ${assessment.result.toUpperCase()}
- **Justification:** ${assessment.justification}
- **Test Performed On:** ${assessment.testPerformedOn}
- **Test Executed By:** ${assessment.testExecutedBy}
- **Assessed Date:** ${new Date(assessment.assessedAt).toLocaleDateString()}
${assessment.comments ? `- **Comments:** ${assessment.comments}` : ''}
`).join('')}

---
*Report generated on ${new Date().toLocaleString()}*
`;

  const reportBlob = new Blob([reportContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(reportBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-report.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};