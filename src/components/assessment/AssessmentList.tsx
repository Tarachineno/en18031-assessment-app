import React from 'react';
import { Card, Button } from '../common';

export const AssessmentList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Assessments</h2>
        <Button>Start New Assessment</Button>
      </div>

      <Card title="Assessment History" subtitle="View and manage your assessment records">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
          <p className="text-gray-500 mb-6">Begin by starting your first EN 18031 assessment.</p>
          <Button>Start Your First Assessment</Button>
        </div>
      </Card>
    </div>
  );
};