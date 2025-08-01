import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Button, Card } from './components/common';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  EN 18031 Assessment
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="secondary" size="sm">
                  Settings
                </Button>
                <Button size="sm">
                  User Menu
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex space-x-4 pt-4">
                <Button>
                  Create New Project
                </Button>
                <Button variant="secondary">
                  View Projects
                </Button>
              </div>
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
                <div className="text-3xl font-bold text-success">0%</div>
                <div className="text-sm text-gray-500">Completion Rate</div>
              </div>
            </Card>
            
            <Card title="Recent Activity" className="text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-info">0</div>
                <div className="text-sm text-gray-500">Recent Assessments</div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
