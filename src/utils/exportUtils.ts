import { Project, Assessment, EvidenceFile, TestCase } from '../types';
import jsPDF from 'jspdf';

interface ExportData {
  projects: Project[];
  assessments: Assessment[];
  evidenceFiles: EvidenceFile[];
  exportedAt: string;
  version: string;
}

export type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf' | 'markdown';

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

// CSV Export Functions
export const exportAssessmentsAsCSV = (
  assessments: Assessment[],
  testCases: TestCase[],
  filename?: string
): void => {
  const headers = [
    'Assessment ID',
    'Project ID',
    'Test Case ID',
    'Test Case Title',
    'Mechanism',
    'Assessment Type',
    'Result',
    'Justification',
    'Comments',
    'Test Performed On',
    'Test Executed By',
    'Assessed At',
    'Assessed By',
    'Status',
    'Version'
  ];

  const rows = assessments.map(assessment => {
    const testCase = testCases.find(tc => tc.id === assessment.testCaseId);
    return [
      assessment.id,
      assessment.projectId,
      assessment.testCaseId,
      testCase?.title || 'Unknown',
      testCase?.mechanism || 'Unknown',
      testCase?.assessmentType || 'Unknown',
      assessment.result,
      `"${assessment.justification.replace(/"/g, '""')}"`,
      `"${(assessment.comments || '').replace(/"/g, '""')}"`,
      assessment.testPerformedOn,
      assessment.testExecutedBy,
      new Date(assessment.assessedAt).toLocaleDateString(),
      assessment.assessedBy,
      assessment.status,
      assessment.version
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `assessments-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// XML Export Functions
export const exportProjectAsXML = (
  project: Project,
  assessments: Assessment[],
  evidenceFiles: EvidenceFile[],
  testCases: TestCase[]
): void => {
  const projectAssessments = assessments.filter(a => a.projectId === project.id);
  const projectEvidenceFiles = evidenceFiles.filter(f => 
    projectAssessments.some(a => a.id === f.assessmentId)
  );

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<EN18031Assessment>
  <ExportInfo>
    <ExportedAt>${new Date().toISOString()}</ExportedAt>
    <Version>1.0.0</Version>
    <Standard>EN 18031</Standard>
  </ExportInfo>
  
  <Project>
    <ID>${project.id}</ID>
    <Name><![CDATA[${project.name}]]></Name>
    <Description><![CDATA[${project.description || ''}]]></Description>
    <ProductName><![CDATA[${project.productName}]]></ProductName>
    <Manufacturer><![CDATA[${project.manufacturer}]]></Manufacturer>
    <ModelReference><![CDATA[${project.modelReference}]]></ModelReference>
    <TestStandard><![CDATA[${project.testStandard}]]></TestStandard>
    <TestLaboratory><![CDATA[${project.testLaboratory}]]></TestLaboratory>
    <ReportReference><![CDATA[${project.reportReference}]]></ReportReference>
    <Status>${project.status}</Status>
    <CreatedAt>${project.createdAt}</CreatedAt>
    <UpdatedAt>${project.updatedAt}</UpdatedAt>
    <CreatedBy><![CDATA[${project.createdBy}]]></CreatedBy>
    <Version>${project.version}</Version>
  </Project>
  
  <Assessments>
${projectAssessments.map(assessment => {
  const testCase = testCases.find(tc => tc.id === assessment.testCaseId);
  return `    <Assessment>
      <ID>${assessment.id}</ID>
      <TestCaseID>${assessment.testCaseId}</TestCaseID>
      <TestCase>
        <Title><![CDATA[${testCase?.title || 'Unknown'}]]></Title>
        <Mechanism>${testCase?.mechanism || 'Unknown'}</Mechanism>
        <AssessmentType>${testCase?.assessmentType || 'Unknown'}</AssessmentType>
      </TestCase>
      <Result>${assessment.result}</Result>
      <Justification><![CDATA[${assessment.justification}]]></Justification>
      <Comments><![CDATA[${assessment.comments || ''}]]></Comments>
      <TestPerformedOn><![CDATA[${assessment.testPerformedOn}]]></TestPerformedOn>
      <TestExecutedBy><![CDATA[${assessment.testExecutedBy}]]></TestExecutedBy>
      <AssessedAt>${assessment.assessedAt}</AssessedAt>
      <AssessedBy><![CDATA[${assessment.assessedBy}]]></AssessedBy>
      <Status>${assessment.status}</Status>
      <Version>${assessment.version}</Version>
    </Assessment>`;
}).join('\n')}
  </Assessments>
  
  <EvidenceFiles>
${projectEvidenceFiles.map(file => `    <EvidenceFile>
      <ID>${file.id}</ID>
      <AssessmentID>${file.assessmentId}</AssessmentID>
      <FileName><![CDATA[${file.fileName}]]></FileName>
      <FileType>${file.fileType}</FileType>
      <FileSize>${file.fileSize}</FileSize>
      <MimeType><![CDATA[${file.mimeType}]]></MimeType>
      <Description><![CDATA[${file.description || ''}]]></Description>
      <UploadedAt>${file.uploadedAt}</UploadedAt>
      <UploadedBy><![CDATA[${file.uploadedBy}]]></UploadedBy>
      <SharepointUrl><![CDATA[${file.sharepointUrl}]]></SharepointUrl>
    </EvidenceFile>`).join('\n')}
  </EvidenceFiles>
</EN18031Assessment>`;

  const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(xmlBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-export.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Enhanced PDF Export Functions
export const exportProjectAsPDF = (
  project: Project,
  assessments: Assessment[],
  testCases: TestCase[]
): void => {
  const doc = new jsPDF();
  const projectAssessments = assessments.filter(a => a.projectId === project.id);
  
  const passedCount = projectAssessments.filter(a => a.result === 'pass').length;
  const failedCount = projectAssessments.filter(a => a.result === 'fail').length;
  const naCount = projectAssessments.filter(a => a.result === 'na').length;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EN 18031 Assessment Report', 20, 30);
  
  // Project Information
  doc.setFontSize(16);
  doc.text('Project Information', 20, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 65;
  const projectInfo = [
    `Project Name: ${project.name}`,
    `Product Name: ${project.productName}`,
    `Manufacturer: ${project.manufacturer}`,
    `Model Reference: ${project.modelReference}`,
    `Test Standard: ${project.testStandard}`,
    `Test Laboratory: ${project.testLaboratory}`,
    `Report Reference: ${project.reportReference}`,
    `Created: ${new Date(project.createdAt).toLocaleDateString()}`,
    `Last Updated: ${new Date(project.updatedAt).toLocaleDateString()}`
  ];

  projectInfo.forEach(info => {
    doc.text(info, 20, yPos);
    yPos += 8;
  });

  // Assessment Summary
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Summary', 20, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const summaryInfo = [
    `Total Assessments: ${projectAssessments.length}`,
    `Passed: ${passedCount}`,
    `Failed: ${failedCount}`,
    `Not Applicable: ${naCount}`,
    `Completion Rate: ${projectAssessments.length > 0 ? Math.round((passedCount + failedCount + naCount) / projectAssessments.length * 100) : 0}%`
  ];

  summaryInfo.forEach(info => {
    doc.text(info, 20, yPos);
    yPos += 8;
  });

  // Assessment Details
  if (projectAssessments.length > 0) {
    yPos += 15;
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Details', 20, yPos);
    yPos += 15;

    projectAssessments.forEach((assessment, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      const testCase = testCases.find(tc => tc.id === assessment.testCaseId);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Assessment ${index + 1}`, 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const assessmentDetails = [
        `Test Case: ${testCase?.title || 'Unknown'}`,
        `Mechanism: ${testCase?.mechanism || 'Unknown'}`,
        `Result: ${assessment.result.toUpperCase()}`,
        `Test Performed On: ${assessment.testPerformedOn}`,
        `Test Executed By: ${assessment.testExecutedBy}`,
        `Assessed Date: ${new Date(assessment.assessedAt).toLocaleDateString()}`
      ];

      assessmentDetails.forEach(detail => {
        doc.text(detail, 25, yPos);
        yPos += 6;
      });

      // Justification with text wrapping
      if (assessment.justification) {
        doc.text('Justification:', 25, yPos);
        yPos += 6;
        const justificationLines = doc.splitTextToSize(assessment.justification, 160);
        doc.text(justificationLines, 30, yPos);
        yPos += justificationLines.length * 6;
      }

      // Comments with text wrapping
      if (assessment.comments) {
        yPos += 3;
        doc.text('Comments:', 25, yPos);
        yPos += 6;
        const commentLines = doc.splitTextToSize(assessment.comments, 160);
        doc.text(commentLines, 30, yPos);
        yPos += commentLines.length * 6;
      }

      yPos += 10;
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report generated on ${new Date().toLocaleString()}`, 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  }

  doc.save(`${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-report.pdf`);
};

// Universal Export Function
// Import Functions
export const parseCSVAssessments = (csvContent: string): Partial<Assessment>[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV file must contain headers and at least one data row');
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const assessments: Partial<Assessment>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;

    const assessment: Partial<Assessment> = {};
    headers.forEach((header, index) => {
      const value = values[index];
      switch (header) {
        case 'Assessment ID':
          assessment.id = value;
          break;
        case 'Project ID':
          assessment.projectId = value;
          break;
        case 'Test Case ID':
          assessment.testCaseId = value;
          break;
        case 'Result':
          assessment.result = value as 'pass' | 'fail' | 'na';
          break;
        case 'Justification':
          assessment.justification = value;
          break;
        case 'Comments':
          assessment.comments = value || undefined;
          break;
        case 'Test Performed On':
          assessment.testPerformedOn = value;
          break;
        case 'Test Executed By':
          assessment.testExecutedBy = value;
          break;
        case 'Assessed By':
          assessment.assessedBy = value;
          break;
        case 'Status':
          assessment.status = value as 'draft' | 'completed' | 'reviewed';
          break;
        case 'Version':
          assessment.version = parseInt(value) || 1;
          break;
      }
    });

    // Set defaults for required fields
    assessment.evidenceFiles = [];
    assessment.testStepResults = [];
    assessment.assessedAt = assessment.assessedAt || new Date().toISOString();

    assessments.push(assessment);
  }

  return assessments;
};

export const parseXMLProject = (xmlContent: string): { project: Partial<Project>, assessments: Partial<Assessment>[], evidenceFiles: Partial<EvidenceFile>[] } => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid XML format');
  }

  const result: { project: Partial<Project>, assessments: Partial<Assessment>[], evidenceFiles: Partial<EvidenceFile>[] } = {
    project: {},
    assessments: [],
    evidenceFiles: []
  };

  // Parse project information
  const projectElement = xmlDoc.getElementsByTagName('Project')[0];
  if (projectElement) {
    const getElementText = (tagName: string) => {
      const element = projectElement.getElementsByTagName(tagName)[0];
      return element ? element.textContent || '' : '';
    };

    result.project = {
      id: getElementText('ID'),
      name: getElementText('Name'),
      description: getElementText('Description') || undefined,
      productName: getElementText('ProductName'),
      manufacturer: getElementText('Manufacturer'),
      modelReference: getElementText('ModelReference'),
      testStandard: getElementText('TestStandard'),
      testLaboratory: getElementText('TestLaboratory'),
      reportReference: getElementText('ReportReference'),
      status: getElementText('Status') as 'draft' | 'active' | 'completed' | 'archived',
      createdAt: getElementText('CreatedAt'),
      updatedAt: getElementText('UpdatedAt'),
      createdBy: getElementText('CreatedBy'),
      version: parseInt(getElementText('Version')) || 1,
      assignees: []
    };
  }

  // Parse assessments
  const assessmentElements = xmlDoc.getElementsByTagName('Assessment');
  for (let i = 0; i < assessmentElements.length; i++) {
    const element = assessmentElements[i];
    const getElementText = (tagName: string) => {
      const el = element.getElementsByTagName(tagName)[0];
      return el ? el.textContent || '' : '';
    };

    const assessment: Partial<Assessment> = {
      id: getElementText('ID'),
      projectId: result.project.id,
      testCaseId: getElementText('TestCaseID'),
      result: getElementText('Result') as 'pass' | 'fail' | 'na',
      justification: getElementText('Justification'),
      comments: getElementText('Comments') || undefined,
      testPerformedOn: getElementText('TestPerformedOn'),
      testExecutedBy: getElementText('TestExecutedBy'),
      assessedAt: getElementText('AssessedAt'),
      assessedBy: getElementText('AssessedBy'),
      status: getElementText('Status') as 'draft' | 'completed' | 'reviewed',
      version: parseInt(getElementText('Version')) || 1,
      evidenceFiles: [],
      testStepResults: []
    };

    result.assessments.push(assessment);
  }

  // Parse evidence files
  const evidenceElements = xmlDoc.getElementsByTagName('EvidenceFile');
  for (let i = 0; i < evidenceElements.length; i++) {
    const element = evidenceElements[i];
    const getElementText = (tagName: string) => {
      const el = element.getElementsByTagName(tagName)[0];
      return el ? el.textContent || '' : '';
    };

    const evidenceFile: Partial<EvidenceFile> = {
      id: getElementText('ID'),
      assessmentId: getElementText('AssessmentID'),
      fileName: getElementText('FileName'),
      fileType: getElementText('FileType') as 'image' | 'log' | 'document' | 'data' | 'video' | 'other',
      fileSize: parseInt(getElementText('FileSize')) || 0,
      mimeType: getElementText('MimeType'),
      description: getElementText('Description') || undefined,
      uploadedAt: getElementText('UploadedAt'),
      uploadedBy: getElementText('UploadedBy'),
      sharepointUrl: getElementText('SharepointUrl'),
      checksum: '',
      tags: []
    };

    result.evidenceFiles.push(evidenceFile);
  }

  return result;
};

export const importAssessmentData = (file: File, format: 'json' | 'csv' | 'xml'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        switch (format) {
          case 'json':
            const jsonData = JSON.parse(content);
            if (!jsonData.projects && !jsonData.project) {
              throw new Error('Invalid JSON format: missing project data');
            }
            resolve(jsonData);
            break;
            
          case 'csv':
            const assessments = parseCSVAssessments(content);
            resolve({ assessments });
            break;
            
          case 'xml':
            const xmlData = parseXMLProject(content);
            resolve(xmlData);
            break;
            
          default:
            throw new Error(`Unsupported import format: ${format}`);
        }
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

export const exportAssessmentData = (
  format: ExportFormat,
  project: Project,
  assessments: Assessment[],
  evidenceFiles: EvidenceFile[],
  testCases: TestCase[]
): void => {
  switch (format) {
    case 'json':
      exportSingleProject(project, assessments, evidenceFiles);
      break;
    case 'csv':
      const projectAssessments = assessments.filter(a => a.projectId === project.id);
      exportAssessmentsAsCSV(projectAssessments, testCases, 
        `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-assessments.csv`);
      break;
    case 'xml':
      exportProjectAsXML(project, assessments, evidenceFiles, testCases);
      break;
    case 'pdf':
      exportProjectAsPDF(project, assessments, testCases);
      break;
    case 'markdown':
      generateProjectReport(project, assessments);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};