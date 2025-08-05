import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar, Input } from '../common';
import { useProjectStore, useAssessmentStore } from '../../stores';
import { getTestCaseById } from '../../data/testCases';
import { CreateAssessmentRequest, TestStepResult, UpdateAssessmentRequest, Assessment } from '../../types';
import { ConceptualAssessment, AssessmentResult } from './ConceptualAssessment';
import { EditAssessmentModal } from './EditAssessmentModal';

interface AssessmentExecutionProps {}

type ViewMode = 'list' | 'assessment';

export const AssessmentExecution: React.FC<AssessmentExecutionProps> = () => {
  const { projectId, testCaseId } = useParams<{ projectId: string; testCaseId: string }>();
  const navigate = useNavigate();
  
  const { getProject } = useProjectStore();
  const { createAssessment, getAssessmentsByProject, updateAssessment, deleteAssessment } = useAssessmentStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [assessmentData, setAssessmentData] = useState<Partial<CreateAssessmentRequest>>({
    result: undefined,
    justification: '',
    comments: '',
    testPerformedOn: '',
    testExecutedBy: '',
    testStepResults: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [, setDeletingAssessmentId] = useState<string | null>(null);

  const project = projectId ? getProject(projectId) : null;
  const testCase = testCaseId ? getTestCaseById(testCaseId) : null;
  const existingAssessments = projectId ? getAssessmentsByProject(projectId).filter(a => a.testCaseId === testCaseId) : [];

  useEffect(() => {
    if (!project || !testCase) return;
    
    // Initialize test step results
    const stepResults: TestStepResult[] = testCase.testSteps.map(step => ({
      testStepId: step.id,
      result: 'na',
      actualResult: '',
      screenshots: [],
    }));
    
    setAssessmentData(prev => ({
      ...prev,
      testStepResults: stepResults,
      testPerformedOn: project.productName,
      testExecutedBy: 'current_user', // TODO: Get from auth context
    }));
  }, [project, testCase]);

  if (!project || !testCase) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment not found</h3>
          <p className="text-gray-500 mb-6">The project or test case you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/assessments')}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = testCase.testSteps[currentStepIndex];
  const totalSteps = testCase.testSteps.length;
  const completedSteps = assessmentData.testStepResults?.filter(r => r.result !== 'na').length || 0;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const updateStepResult = (stepId: string, field: keyof TestStepResult, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      testStepResults: prev.testStepResults?.map(step =>
        step.testStepId === stepId ? { ...step, [field]: value } : step
      ) || [],
    }));
  };

  const getCurrentStepResult = () => {
    return assessmentData.testStepResults?.find(r => r.testStepId === currentStep.id);
  };

  const canProceedToNext = () => {
    const stepResult = getCurrentStepResult();
    return stepResult && stepResult.result !== 'na' && stepResult.actualResult.trim() !== '';
  };

  const calculateOverallResult = () => {
    const results = assessmentData.testStepResults || [];
    const hasFailures = results.some(r => r.result === 'fail');
    const allCompleted = results.every(r => r.result !== 'na');
    
    if (hasFailures) return 'fail';
    if (allCompleted) return 'pass';
    return 'na';
  };

  const handleSubmitAssessment = async () => {
    if (!testCase || !projectId) return;
    
    setIsSubmitting(true);
    try {
      const overallResult = calculateOverallResult();
      const assessmentRequest: CreateAssessmentRequest = {
        testCaseId: testCase.id,
        result: overallResult,
        justification: assessmentData.justification || '',
        comments: assessmentData.comments,
        testPerformedOn: assessmentData.testPerformedOn || '',
        testExecutedBy: assessmentData.testExecutedBy || '',
        testStepResults: assessmentData.testStepResults || [],
      };
      
      await createAssessment(assessmentRequest, projectId);
      setViewMode('list');
      
      // Reset form
      setCurrentStepIndex(0);
      setAssessmentData({
        result: undefined,
        justification: '',
        comments: '',
        testPerformedOn: project.productName,
        testExecutedBy: 'current_user',
        testStepResults: testCase.testSteps.map(step => ({
          testStepId: step.id,
          result: 'na',
          actualResult: '',
          screenshots: [],
        })),
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConceptualAssessmentComplete = async (results: AssessmentResult[]) => {
    if (!testCase || !projectId || !project) return;
    
    setIsSubmitting(true);
    try {
      // Create summary of all asset assessments
      const overallResult = results.some(r => r.verdict === 'FAIL') ? 'fail' : 
                           results.every(r => r.verdict === 'NOT APPLICABLE') ? 'na' : 'pass';
      
      const justificationSummary = `Assessment completed for ${results.length} asset(s):\n` +
        results.map(r => `- ${r.assetId} (${r.assetName}): ${r.verdict} (${r.decisionNode}) - ${r.justification}`).join('\n');

      const assessmentRequest: CreateAssessmentRequest = {
        testCaseId: testCase.id,
        result: overallResult,
        justification: justificationSummary,
        comments: `Conceptual assessment using decision tree methodology. Assessed ${results.length} assets with individual verdicts and justifications.`,
        testPerformedOn: project.productName,
        testExecutedBy: 'current_user',
        testStepResults: [],
      };
      
      await createAssessment(assessmentRequest, projectId);
      setViewMode('list');
      
      // Reset form
      setCurrentStepIndex(0);
      setAssessmentData({
        result: undefined,
        justification: '',
        comments: '',
        testPerformedOn: project.productName,
        testExecutedBy: 'current_user',
        testStepResults: [],
      });
    } catch (error) {
      console.error('Failed to submit conceptual assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAssessment = async (id: string, data: UpdateAssessmentRequest) => {
    try {
      await updateAssessment(id, data);
      setEditingAssessment(null);
    } catch (error) {
      console.error('Failed to update assessment:', error);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    try {
      await deleteAssessment(id);
      setDeletingAssessmentId(null);
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  const confirmDelete = (assessmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      handleDeleteAssessment(assessmentId);
    }
  };

  // Check if this is ACM-1 conceptual assessment
  const isACM1Conceptual = testCase?.id === 'acm-001-conceptual';

  // List view - show existing assessments
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <button onClick={() => navigate('/projects')} className="hover:text-gray-700">
                Projects
              </button>
              <span>›</span>
              <button onClick={() => navigate(`/projects/${projectId}`)} className="hover:text-gray-700">
                {project.name}
              </button>
              <span>›</span>
              <span className="text-gray-900">Assessment Results</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{testCase.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="info">{testCase.mechanism}-{testCase.mechanismNumber}</Badge>
              <Badge variant="default">{testCase.assessmentType.replace('_', ' ')}</Badge>
              <Badge variant="default">
                {existingAssessments.length} existing result{existingAssessments.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setViewMode('assessment')}>
              Add New Assessment
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}`)}>
              Back to Project
            </Button>
          </div>
        </div>

        {/* Test Case Information */}
        <Card title="Test Case Information">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Objective</h4>
              <p className="text-sm text-gray-600 mt-1">{testCase.objective}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Assessment Units</h4>
              <p className="text-sm text-gray-600 mt-1">{testCase.assessmentUnits}</p>
            </div>
          </div>
        </Card>

        {/* Existing Assessment Results */}
        <Card title={`Assessment Results (${existingAssessments.length})`}>
          {existingAssessments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-500 mb-6">Start your first assessment for this test case.</p>
              <Button onClick={() => setViewMode('assessment')}>
                Start First Assessment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {existingAssessments.map((assessment, index) => (
                <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {/* Extract Asset ID from conceptual assessments or show assessment number for others */}
                      {assessment.justification.includes('Assessment completed for') ? (
                        (() => {
                          const assetLines = assessment.justification
                            .split('\n')
                            .filter(line => line.trim().startsWith('- '));
                          const firstAssetId = assetLines[0]?.match(/- ([^(]+) \(/)?.[1]?.trim();
                          
                          if (assetLines.length === 1 && firstAssetId) {
                            // Single asset - show the Asset ID
                            return <h4 className="font-bold text-lg text-gray-900">{firstAssetId}</h4>;
                          } else if (assetLines.length > 1) {
                            // Multiple assets - show "Multiple Assets" or count
                            return <h4 className="font-bold text-lg text-gray-900">Multiple Assets ({assetLines.length})</h4>;
                          } else {
                            // Fallback
                            return <h4 className="font-medium text-gray-900">Assessment #{index + 1}</h4>;
                          }
                        })()
                      ) : (
                        <h4 className="font-medium text-gray-900">Assessment #{index + 1}</h4>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(assessment.assessedAt).toLocaleDateString()} by {assessment.assessedBy}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        assessment.result === 'pass' ? 'success' : 
                        assessment.result === 'fail' ? 'error' : 'default'
                      }
                    >
                      {assessment.result.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Parse and display Asset Information for conceptual assessments */}
                    {assessment.justification.includes('Assessment completed for') && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Asset Assessment Results</h5>
                        <div className="space-y-2 mt-2">
                          {assessment.justification
                            .split('\n')
                            .filter(line => line.trim().startsWith('- '))
                            .map((line, idx) => {
                              const match = line.match(/- ([^(]+) \(([^)]+)\): ([^(]+) \(([^)]+)\) - (.+)/);
                              if (match) {
                                const [, assetId, assetName, verdict, decisionNode, justification] = match;
                                return (
                                  <div key={idx} className="p-2 bg-gray-50 rounded border-l-4 border-blue-300">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-bold text-base text-gray-900">{assetId.trim()}</span>
                                      <span className="font-bold text-sm text-gray-700">({assetName.trim()})</span>
                                      <Badge
                                        variant={
                                          verdict.trim() === 'PASS' ? 'success' :
                                          verdict.trim() === 'FAIL' ? 'error' : 'info'
                                        }
                                        className="font-bold"
                                      >
                                        {verdict.trim()}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <div><strong>Decision Node:</strong> {decisionNode.trim()}</div>
                                      <div><strong>Justification:</strong> {justification.trim()}</div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })
                            .filter(Boolean)}
                        </div>
                      </div>
                    )}
                    
                    {/* Regular justification for non-conceptual assessments */}
                    {!assessment.justification.includes('Assessment completed for') && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Justification</h5>
                        <p className="text-sm text-gray-600">{assessment.justification}</p>
                      </div>
                    )}
                    
                    {assessment.comments && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Comments</h5>
                        <p className="text-sm text-gray-600">{assessment.comments}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3 mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Test Performed On</h5>
                        <p className="text-sm text-gray-600 font-medium">{assessment.testPerformedOn}</p>
                      </div>
                      
                      {/* Only show test steps for non-conceptual assessments */}
                      {!assessment.justification.includes('Assessment completed for') && assessment.testStepResults && assessment.testStepResults.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Test Steps Completed</h5>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">
                              {assessment.testStepResults.filter(r => r.result !== 'na').length} / {assessment.testStepResults.length}
                            </span> steps completed
                          </p>
                        </div>
                      )}
                      
                      {/* Show assessment methodology for conceptual assessments */}
                      {assessment.justification.includes('Assessment completed for') && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700">Assessment Methodology</h5>
                          <p className="text-sm text-gray-600 font-medium">Conceptual assessment using decision tree methodology</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Assessment Actions */}
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingAssessment(assessment)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => confirmDelete(assessment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Edit Assessment Modal */}
        <EditAssessmentModal
          isOpen={editingAssessment !== null}
          onClose={() => setEditingAssessment(null)}
          assessment={editingAssessment}
          onSave={handleEditAssessment}
        />
      </div>
    );
  }

  // Assessment execution view
  if (isACM1Conceptual) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <button onClick={() => navigate('/projects')} className="hover:text-gray-700">
                Projects
              </button>
              <span>›</span>
              <button onClick={() => navigate(`/projects/${projectId}`)} className="hover:text-gray-700">
                {project.name}
              </button>
              <span>›</span>
              <button onClick={() => setViewMode('list')} className="hover:text-gray-700">
                Assessment Results
              </button>
              <span>›</span>
              <span className="text-gray-900">Conceptual Assessment</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{testCase.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="info">{testCase.mechanism}-{testCase.mechanismNumber}</Badge>
              <Badge variant="default">{testCase.assessmentType.replace('_', ' ')}</Badge>
              <Badge variant="warning">Decision Tree Assessment</Badge>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setViewMode('list')}>
              Cancel Assessment
            </Button>
          </div>
        </div>

        {/* Enhanced Conceptual Assessment */}
        <ConceptualAssessment
          testCaseId={testCase.id}
          onComplete={handleConceptualAssessmentComplete}
        />
      </div>
    );
  }

  // Standard assessment execution view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <button onClick={() => navigate('/projects')} className="hover:text-gray-700">
              Projects
            </button>
            <span>›</span>
            <button onClick={() => navigate(`/projects/${projectId}`)} className="hover:text-gray-700">
              {project.name}
            </button>
            <span>›</span>
            <button onClick={() => setViewMode('list')} className="hover:text-gray-700">
              Assessment Results
            </button>
            <span>›</span>
            <span className="text-gray-900">New Assessment</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">{testCase.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="info">{testCase.mechanism}-{testCase.mechanismNumber}</Badge>
            <Badge variant="default">{testCase.assessmentType.replace('_', ' ')}</Badge>
            <Badge variant="warning">New Assessment</Badge>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            Cancel Assessment
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card title="Assessment Progress">
        <div className="space-y-4">
          <ProgressBar
            value={progressPercentage}
            label={`Step ${currentStepIndex + 1} of ${totalSteps}`}
            showPercentage
            variant={progressPercentage === 100 ? 'success' : 'default'}
          />
          <div className="text-sm text-gray-600">
            {completedSteps} of {totalSteps} steps completed
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Case Information */}
          <Card title="Test Case Information">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Objective</h4>
                <p className="text-sm text-gray-600 mt-1">{testCase.objective}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Prerequisites</h4>
                <p className="text-sm text-gray-600 mt-1">{testCase.prerequisites}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Test Procedures</h4>
                <p className="text-sm text-gray-600 mt-1">{testCase.testProcedures}</p>
              </div>
            </div>
          </Card>

          {/* Current Step Execution */}
          {currentStep && (
            <Card title={`Step ${currentStep.stepNumber}: Test Execution`}>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Testing Procedure</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">{currentStep.testingProcedure}</p>
                  </div>
                </div>

                {currentStep.expectedResult && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Expected Result</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">{currentStep.expectedResult}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Step Result</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Result
                      </label>
                      <div className="flex space-x-4">
                        {(['pass', 'fail', 'na'] as const).map((result) => (
                          <label key={result} className="flex items-center">
                            <input
                              type="radio"
                              name={`step-result-${currentStep.id}`}
                              value={result}
                              checked={getCurrentStepResult()?.result === result}
                              onChange={(e) => updateStepResult(currentStep.id, 'result', e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">
                              {result === 'na' ? 'Not Applicable' : result}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Input
                        label="Actual Result"
                        value={getCurrentStepResult()?.actualResult || ''}
                        onChange={(e) => updateStepResult(currentStep.id, 'actualResult', e.target.value)}
                        placeholder="Describe what actually happened during the test..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={getCurrentStepResult()?.notes || ''}
                        onChange={(e) => updateStepResult(currentStep.id, 'notes', e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Additional notes about this test step..."
                      />
                    </div>
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                  >
                    Previous Step
                  </Button>
                  
                  {currentStepIndex < totalSteps - 1 ? (
                    <Button
                      onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                      disabled={!canProceedToNext()}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitAssessment}
                      disabled={!canProceedToNext() || isSubmitting}
                      loading={isSubmitting}
                      variant="primary"
                    >
                      Complete Assessment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Overall Assessment */}
          <Card title="Overall Assessment">
            <div className="space-y-4">
              <Input
                label="Justification"
                value={assessmentData.justification || ''}
                onChange={(e) => setAssessmentData(prev => ({ ...prev, justification: e.target.value }))}
                placeholder="Provide justification for the overall assessment result..."
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={assessmentData.comments || ''}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Any additional comments about this assessment..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assessment Info */}
          <Card title="Assessment Info">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Project</label>
                <p className="text-sm text-gray-900">{project.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Standard</label>
                <p className="text-sm text-gray-900">{testCase.source}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Section</label>
                <p className="text-sm text-gray-900">{testCase.section}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Result</label>
                <Badge variant={
                  calculateOverallResult() === 'pass' ? 'success' : 
                  calculateOverallResult() === 'fail' ? 'error' : 'default'
                }>
                  {calculateOverallResult().toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Step Overview */}
          <Card title="Step Overview">
            <div className="space-y-2">
              {testCase.testSteps.map((step, index) => {
                const stepResult = assessmentData.testStepResults?.find(r => r.testStepId === step.id);
                const isCurrentStep = index === currentStepIndex;
                
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isCurrentStep 
                        ? 'bg-primary-50 border border-primary-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentStepIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Step {step.stepNumber}</span>
                      {stepResult?.result && stepResult.result !== 'na' && (
                        <Badge 
                          size="sm"
                          variant={
                            stepResult.result === 'pass' ? 'success' : 
                            stepResult.result === 'fail' ? 'error' : 'default'
                          }
                        >
                          {stepResult.result.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {step.testingProcedure}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};