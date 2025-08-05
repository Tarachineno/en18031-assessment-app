import { Assessment } from '../types';

/**
 * Generate a content hash for an assessment based on its core content
 * Excludes id, timestamps, and other metadata that shouldn't affect content comparison
 */
export const generateAssessmentContentHash = (assessment: Assessment): string => {
  const contentFields = {
    projectId: assessment.projectId,
    testCaseId: assessment.testCaseId,
    result: assessment.result,
    justification: assessment.justification,
    comments: assessment.comments || '',
    testPerformedOn: assessment.testPerformedOn,
    testExecutedBy: assessment.testExecutedBy,
    testStepResults: assessment.testStepResults.map(step => ({
      testStepId: step.testStepId,
      result: step.result,
      actualResult: step.actualResult,
      notes: step.notes || ''
    })),
    notes: assessment.notes || ''
  };
  
  return btoa(JSON.stringify(contentFields)).replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Check if two assessments have identical content
 */
export const areAssessmentsContentIdentical = (assessment1: Assessment, assessment2: Assessment): boolean => {
  return generateAssessmentContentHash(assessment1) === generateAssessmentContentHash(assessment2);
};

/**
 * Find duplicate assessments in existing data
 */
export const findDuplicateAssessments = (
  newAssessments: Assessment[], 
  existingAssessments: Assessment[]
): {
  duplicates: Array<{
    newAssessment: Assessment;
    existingAssessment: Assessment;
    contentHash: string;
  }>;
  unique: Assessment[];
} => {
  const duplicates: Array<{
    newAssessment: Assessment;
    existingAssessment: Assessment;
    contentHash: string;
  }> = [];
  
  const unique: Assessment[] = [];
  
  // Create hash map of existing assessments
  const existingHashes = new Map<string, Assessment>();
  existingAssessments.forEach(assessment => {
    const hash = generateAssessmentContentHash(assessment);
    existingHashes.set(hash, assessment);
  });
  
  // Check each new assessment for duplicates
  newAssessments.forEach(newAssessment => {
    const contentHash = generateAssessmentContentHash(newAssessment);
    const existingAssessment = existingHashes.get(contentHash);
    
    if (existingAssessment) {
      duplicates.push({
        newAssessment,
        existingAssessment,
        contentHash
      });
    } else {
      unique.push(newAssessment);
    }
  });
  
  return { duplicates, unique };
};

/**
 * Create a summary of duplicate detection results
 */
export const createDuplicateSummary = (
  duplicates: Array<{
    newAssessment: Assessment;
    existingAssessment: Assessment;
    contentHash: string;
  }>
): string => {
  if (duplicates.length === 0) {
    return 'No duplicates found.';
  }
  
  const duplicatesByProject = duplicates.reduce((acc, dup) => {
    const projectId = dup.newAssessment.projectId;
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(dup);
    return acc;
  }, {} as Record<string, typeof duplicates>);
  
  const projectSummaries = Object.entries(duplicatesByProject).map(
    ([projectId, dups]) => `Project ${projectId}: ${dups.length} duplicate(s)`
  );
  
  return `Found ${duplicates.length} duplicate assessment(s):\n${projectSummaries.join('\n')}`;
};