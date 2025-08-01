import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Card, Badge, Button, ProgressBar } from '../common';
import { useProjectStore } from '../../stores';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'default' as const },
  active: { label: 'Active', variant: 'info' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  archived: { label: 'Archived', variant: 'default' as const },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const { getProjectProgress } = useProjectStore();
  const progress = getProjectProgress(project.id);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete?.(project.id);
    }
  };

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {project.productName} - {project.manufacturer}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-3">
              <Badge variant={statusConfig[project.status].variant}>
                {statusConfig[project.status].label}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Progress */}
          {progress && (
            <div className="mb-4">
              <ProgressBar
                value={progress.completionRate}
                label="Progress"
                size="sm"
                variant={progress.completionRate === 100 ? 'success' : 'default'}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{progress.overview.completed} of {progress.overview.total} completed</span>
                <span>{progress.overview.passed} passed</span>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Standard:</span>
              <span className="text-gray-900">{project.testStandard}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Laboratory:</span>
              <span className="text-gray-900 truncate ml-2">{project.testLaboratory}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Model:</span>
              <span className="text-gray-900 truncate ml-2">{project.modelReference}</span>
            </div>
          </div>

          {/* Assignees */}
          {project.assignees.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Assignees:</div>
              <div className="flex flex-wrap gap-1">
                {project.assignees.slice(0, 3).map((assignee) => (
                  <span
                    key={assignee}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {assignee.split('@')[0]}
                  </span>
                ))}
                {project.assignees.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{project.assignees.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Created {formatDate(project.createdAt)}
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="text-xs px-2 py-1"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};