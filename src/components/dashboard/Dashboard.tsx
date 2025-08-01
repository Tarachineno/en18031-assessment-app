import React from 'react';
import { Card } from '../common';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      </div>

      <Card 
        title="Welcome to EN 18031 Assessment Tool"
        subtitle="Streamline your security assessment workflow"
        className="mb-8"
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
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Quick Stats" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary-600">0</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
        </Card>
        
        <Card title="Progress Overview" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">0%</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </Card>
        
        <Card title="Recent Activity" className="text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500">Recent Assessments</div>
          </div>
        </Card>
      </div>
    </div>
  );
};