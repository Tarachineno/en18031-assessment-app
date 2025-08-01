import React from 'react';
import { Card, Button } from '../common';

export const ProjectList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
        <Button>Create New Project</Button>
      </div>

      <Card title="Your Projects" subtitle="Manage your EN 18031 assessment projects">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first assessment project.</p>
          <Button>Create Your First Project</Button>
        </div>
      </Card>
    </div>
  );
};