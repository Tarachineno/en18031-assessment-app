import React from 'react';
import { Card, Button } from '../common';

export const EvidenceManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Evidence Files</h2>
        <Button>Upload Evidence</Button>
      </div>

      <Card title="Evidence Library" subtitle="Manage documents and files for your assessments">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No evidence files</h3>
          <p className="text-gray-500 mb-6">Upload documents, images, and other evidence files.</p>
          <Button>Upload Your First File</Button>
        </div>
      </Card>
    </div>
  );
};