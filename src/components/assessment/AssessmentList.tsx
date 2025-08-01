import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Input, Modal } from '../common';
import { useProjectStore, useAssessmentStore } from '../../stores';
import { getAllTestCases, getTestCasesByStandard } from '../../data/testCases';
import { TestCase } from '../../types';

export const AssessmentList: React.FC = () => {
  const navigate = useNavigate();
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [standardFilter, setStandardFilter] = useState<'all' | 'EN18031-1' | 'EN18031-2'>('all');
  const [mechanismFilter, setMechanismFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { projects, getProjectsByStatus } = useProjectStore();
  const { assessments, loadTestCases } = useAssessmentStore();

  const activeProjects = getProjectsByStatus('active');
  const allTestCases = getAllTestCases();

  useEffect(() => {
    // Load test cases for both standards
    loadTestCases('EN18031-1');
    loadTestCases('EN18031-2');
  }, [loadTestCases]);

  const filteredTestCases = React.useMemo(() => {
    let cases = allTestCases;

    if (standardFilter !== 'all') {
      cases = getTestCasesByStandard(standardFilter);
    }

    if (mechanismFilter !== 'all') {
      cases = cases.filter(tc => tc.mechanism === mechanismFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cases = cases.filter(tc =>
        tc.title.toLowerCase().includes(query) ||
        tc.mechanism.toLowerCase().includes(query) ||
        tc.objective.toLowerCase().includes(query)
      );
    }

    return cases;
  }, [allTestCases, standardFilter, mechanismFilter, searchQuery]);

  const getAssessmentStatus = (testCase: TestCase, projectId: string) => {
    const assessment = assessments.find(a => a.testCaseId === testCase.id && a.projectId === projectId);
    return assessment ? assessment.result : 'not_started';
  };

  const getAssessmentCount = (status: string) => {
    switch (status) {
      case 'completed':
        return assessments.filter(a => a.status === 'completed').length;
      case 'passed':
        return assessments.filter(a => a.result === 'pass').length;
      case 'failed':
        return assessments.filter(a => a.result === 'fail').length;
      default:
        return assessments.length;
    }
  };

  const uniqueMechanisms = Array.from(new Set(allTestCases.map(tc => tc.mechanism)));

  const handleStartAssessment = (testCaseId: string, projectId?: string) => {
    const projectToUse = projectId || selectedProject;
    if (!projectToUse) return;
    navigate(`/projects/${projectToUse}/assessments/${testCaseId}`);
    setIsStartModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Assessments</h2>
          <p className="text-gray-600 mt-1">Manage EN 18031 security assessments and test cases</p>
        </div>
        <Button onClick={() => setIsStartModalOpen(true)} disabled={activeProjects.length === 0}>
          Start New Assessment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Assessments" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary-600">{assessments.length}</div>
            <div className="text-sm text-gray-500">All Time</div>
          </div>
        </Card>
        
        <Card title="Completed" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">{getAssessmentCount('completed')}</div>
            <div className="text-sm text-gray-500">Finished</div>
          </div>
        </Card>
        
        <Card title="Passed" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">{getAssessmentCount('passed')}</div>
            <div className="text-sm text-gray-500">Successful</div>
          </div>
        </Card>
        
        <Card title="Failed" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-red-600">{getAssessmentCount('failed')}</div>
            <div className="text-sm text-gray-500">Need Review</div>
          </div>
        </Card>
      </div>

      {activeProjects.length === 0 ? (
        <Card title="No Active Projects" subtitle="You need an active project to start assessments">
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active projects</h3>
            <p className="text-gray-500 mb-6">Create or activate a project to start performing assessments.</p>
            <Link to="/projects">
              <Button>Go to Projects</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search test cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon="🔍"
              />
              
              <select
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Standards</option>
                <option value="EN18031-1">EN 18031-1</option>
                <option value="EN18031-2">EN 18031-2</option>
              </select>

              <select
                value={mechanismFilter}
                onChange={(e) => setMechanismFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Mechanisms</option>
                {uniqueMechanisms.map(mechanism => (
                  <option key={mechanism} value={mechanism}>{mechanism}</option>
                ))}
              </select>

              <div className="text-sm text-gray-500 flex items-center">
                {filteredTestCases.length} test cases found
              </div>
            </div>
          </Card>

          {/* Test Cases */}
          <Card title="Available Test Cases" subtitle="Select a test case to start assessment">
            {filteredTestCases.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No test cases found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTestCases.map((testCase) => (
                  <div key={testCase.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{testCase.title}</h3>
                          <Badge variant="info">{testCase.mechanism}-{testCase.mechanismNumber}</Badge>
                          <Badge variant="default">{testCase.assessmentType.replace('_', ' ')}</Badge>
                          <Badge variant="info">{testCase.source}</Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{testCase.objective}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Prerequisites:</span>
                            <p className="text-gray-600 mt-1">{testCase.prerequisites}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Test Steps:</span>
                            <p className="text-gray-600 mt-1">{testCase.testSteps.length} steps</p>
                          </div>
                        </div>

                        {/* Assessment Status for Active Projects */}
                        <div className="mt-4">
                          <span className="font-medium text-gray-500 text-sm">Assessment Status:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {activeProjects.map(project => {
                              const status = getAssessmentStatus(testCase, project.id);
                              return (
                                <div key={project.id} className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">{project.name}:</span>
                                  <Badge 
                                    size="sm"
                                    variant={
                                      status === 'pass' ? 'success' :
                                      status === 'fail' ? 'error' :
                                      status === 'na' ? 'default' : 'default'
                                    }
                                  >
                                    {status === 'not_started' ? 'Not Started' : status.toUpperCase()}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (activeProjects.length === 1) {
                              // If only one active project, start assessment directly
                              handleStartAssessment(testCase.id, activeProjects[0].id);
                            } else {
                              // If multiple projects, open modal to select
                              setIsStartModalOpen(true);
                            }
                          }}
                        >
                          Start Assessment
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Assessments */}
          {assessments.length > 0 && (
            <Card title="Recent Assessments" subtitle="Your latest assessment activity">
              <div className="space-y-4">
                {assessments.slice(-5).reverse().map((assessment) => {
                  const project = projects.find(p => p.id === assessment.projectId);
                  const testCase = allTestCases.find(tc => tc.id === assessment.testCaseId);
                  
                  return (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {testCase?.title || 'Unknown Test Case'}
                          </h4>
                          <Badge variant={
                            assessment.result === 'pass' ? 'success' : 
                            assessment.result === 'fail' ? 'error' : 'default'
                          }>
                            {assessment.result.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Project: {project?.name || 'Unknown Project'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Assessed on {new Date(assessment.assessedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          assessment.status === 'completed' ? 'success' :
                          assessment.status === 'reviewed' ? 'info' : 'default'
                        }>
                          {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Start Assessment Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Start New Assessment"
        closeOnBackdropClick={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Choose a project...</option>
              {activeProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.testStandard})
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Test Cases
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredTestCases.map(testCase => (
                  <div
                    key={testCase.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleStartAssessment(testCase.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{testCase.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{testCase.mechanism}-{testCase.mechanismNumber}</p>
                      </div>
                      <Badge variant={
                        getAssessmentStatus(testCase, selectedProject) === 'pass' ? 'success' :
                        getAssessmentStatus(testCase, selectedProject) === 'fail' ? 'error' :
                        getAssessmentStatus(testCase, selectedProject) === 'na' ? 'default' : 'default'
                      }>
                        {getAssessmentStatus(testCase, selectedProject) === 'not_started' ? 'New' : 
                         getAssessmentStatus(testCase, selectedProject).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setIsStartModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};