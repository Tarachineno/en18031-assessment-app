import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar, Input } from '../common';
import { useProjectStore, useAssessmentStore } from '../../stores';
import { getTestCaseById } from '../../data/testCases';
import { CreateAssessmentRequest, TestStepResult } from '../../types';

export const AssessmentExecution: React.FC = () => {
  const { projectId, testCaseId } = useParams<{ projectId: string; testCaseId: string }>();
  const navigate = useNavigate();
  
  const { getProject } = useProjectStore();
  const { createAssessment, getAssessmentsByProject } = useAssessmentStore();
  
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

  const project = projectId ? getProject(projectId) : null;
  const testCase = testCaseId ? getTestCaseById(testCaseId) : null;
  const existingAssessments = projectId ? getAssessmentsByProject(projectId) : [];
  const existingAssessment = existingAssessments.find(a => a.testCaseId === testCaseId);

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
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-gray-900">Assessment</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">{testCase.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="info">{testCase.mechanism}-{testCase.mechanismNumber}</Badge>
            <Badge variant="default">{testCase.assessmentType.replace('_', ' ')}</Badge>
            <Badge variant={existingAssessment ? 'warning' : 'default'}>
              {existingAssessment ? 'Re-assessment' : 'New Assessment'}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => navigate(`/projects/${projectId}`)}>
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