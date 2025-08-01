import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, ProgressBar } from '../common';
import { useProjectStore, useAssessmentStore, useEvidenceStore } from '../../stores';
import { exportSingleProject, generateProjectReport } from '../../utils/exportUtils';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, getProjectProgress, setCurrentProject } = useProjectStore();
  const { getAssessmentsByProject, assessments } = useAssessmentStore();
  const { files } = useEvidenceStore();

  const project = id ? getProject(id) : null;
  const progress = id ? getProjectProgress(id) : null;
  const projectAssessments = id ? getAssessmentsByProject(id) : [];

  const handleExportProject = () => {
    if (project) {
      exportSingleProject(project, assessments, files);
    }
  };

  const handleGenerateReport = () => {
    if (project) {
      generateProjectReport(project, assessments);
    }
  };

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
    return () => setCurrentProject(null);
  }, [project, setCurrentProject]);

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-500 mb-6">The project you're looking for doesn't exist.</p>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    draft: { label: 'Draft', variant: 'default' as const },
    active: { label: 'Active', variant: 'info' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    archived: { label: 'Archived', variant: 'default' as const },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link to="/projects" className="text-primary-600 hover:text-primary-700">
              ← Back to Projects
            </Link>
            <Badge variant={statusConfig[project.status].variant}>
              {statusConfig[project.status].label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            onClick={() => {
              // TODO: Implement edit project modal
              console.log('Edit project clicked');
            }}
          >
            Edit Project
          </Button>
          <Button 
            onClick={() => navigate('/assessments')}
          >
            Start Assessment
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {progress && (
        <Card title="Progress Overview">
          <div className="space-y-6">
            <ProgressBar
              value={progress.completionRate}
              label="Overall Progress"
              showPercentage
              variant={progress.completionRate === 100 ? 'success' : 'default'}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{progress.overview.total}</div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.overview.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.overview.passed}</div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{progress.overview.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{progress.overview.notApplicable}</div>
                <div className="text-sm text-gray-500">N/A</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Project Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Product Name</label>
                <p className="mt-1 text-sm text-gray-900">{project.productName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Manufacturer</label>
                <p className="mt-1 text-sm text-gray-900">{project.manufacturer}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Model Reference</label>
                <p className="mt-1 text-sm text-gray-900">{project.modelReference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Test Standard</label>
                <p className="mt-1 text-sm text-gray-900">{project.testStandard}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Test Laboratory</label>
                <p className="mt-1 text-sm text-gray-900">{project.testLaboratory}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Report Reference</label>
                <p className="mt-1 text-sm text-gray-900">{project.reportReference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(project.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Assessments */}
          <Card title="Recent Assessments" subtitle="Latest assessment activity">
            {projectAssessments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                <p className="text-gray-500 mb-4">Start by creating your first assessment for this project.</p>
                <Button>Start First Assessment</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projectAssessments.slice(0, 5).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Test Case {assessment.testCaseId}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {assessment.justification.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={assessment.result === 'pass' ? 'success' : assessment.result === 'fail' ? 'error' : 'default'}>
                        {assessment.result.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(assessment.assessedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {projectAssessments.length > 5 && (
                  <div className="text-center pt-4 border-t border-gray-100">
                    <Link to={`/projects/${project.id}/assessments`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all assessments →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team */}
          <Card title="Team">
            {project.assignees.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No assignees yet</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Add Team Members
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {project.assignees.map((assignee) => (
                  <div key={assignee} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {assignee.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{assignee}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  Manage Team
                </Button>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="ghost">
                <span className="mr-3">📊</span>
                Start Assessment
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                <span className="mr-3">📁</span>
                Upload Evidence
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="ghost"
                onClick={handleGenerateReport}
              >
                <span className="mr-3">📄</span>
                Generate Report
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="ghost"
                onClick={handleExportProject}
              >
                <span className="mr-3">📤</span>
                Export Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};