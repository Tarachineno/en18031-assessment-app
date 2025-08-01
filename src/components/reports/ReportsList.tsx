import React from 'react';
import { Card, Button } from '../common';

export const ReportsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <Button>Generate Report</Button>
      </div>

      <Card title="Assessment Reports" subtitle="Generate and download assessment reports">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated</h3>
          <p className="text-gray-500 mb-6">Create comprehensive assessment reports from your data.</p>
          <Button>Generate Your First Report</Button>
        </div>
      </Card>
    </div>
  );
};