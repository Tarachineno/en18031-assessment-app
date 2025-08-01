import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../common';
import { useProjectStore, useEvidenceStore } from '../../stores';
import { CreateProjectModal } from '../project';

export const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { projects, getProjectsByStatus } = useProjectStore();
  // const { assessments } = useAssessmentStore(); // Will be used for future analytics
  const { files } = useEvidenceStore();

  const activeProjects = getProjectsByStatus('active');
  const completedProjects = getProjectsByStatus('completed');
  // These will be used for future features
  // const totalAssessments = assessments.length;
  // const recentFiles = files.slice(-5);
  // const averageCompletion = projects.length > 0 ? totalProjectProgress / projects.length : 0;

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your assessments.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create New Project
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Projects" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary-600">{projects.length}</div>
            <div className="text-sm text-gray-500">All Projects</div>
          </div>
        </Card>
        
        <Card title="Active Projects" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">{activeProjects.length}</div>
            <div className="text-sm text-gray-500">Currently Active</div>
          </div>
        </Card>
        
        <Card title="Completed Projects" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">{completedProjects.length}</div>
            <div className="text-sm text-gray-500">Finished</div>
          </div>
        </Card>
        
        <Card title="Evidence Files" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">{files.length}</div>
            <div className="text-sm text-gray-500">Total Files</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card title="Recent Projects" subtitle="Your latest project activity">
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first assessment project.</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.productName} - {project.manufacturer}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <Link
                  to="/projects"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all projects →
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" subtitle="Common tasks to get you started">
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <span className="mr-3">📋</span>
              Create New Project
            </Button>
            <Link to="/assessments">
              <Button className="w-full justify-start" variant="ghost">
                <span className="mr-3">📊</span>
                Start Assessment
              </Button>
            </Link>
            <Link to="/evidence">
              <Button className="w-full justify-start" variant="ghost">
                <span className="mr-3">📁</span>
                Upload Evidence
              </Button>
            </Link>
            <Link to="/reports">
              <Button className="w-full justify-start" variant="ghost">
                <span className="mr-3">📄</span>
                Generate Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Welcome Card (only show if no projects) */}
      {projects.length === 0 && (
        <Card 
          title="Welcome to EN 18031 Assessment Tool"
          subtitle="Streamline your security assessment workflow"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This application helps you efficiently manage EN 18031 security assessments 
              for radio equipment with features like:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Project management and progress tracking</li>
              <li>Streamlined test case evaluation</li>
              <li>Evidence file management</li>
              <li>Automated report generation</li>
              <li>SharePoint/OneDrive integration</li>
            </ul>
            <div className="pt-4">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Get Started - Create Your First Project
              </Button>
            </div>
          </div>
        </Card>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(projectId) => {
          console.log('Project created:', projectId);
        }}
      />
    </div>
  );
};