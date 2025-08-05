import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../common';
import { DecisionTree } from './DecisionTree';

export interface Asset {
  id: string;
  name: string;
  type: 'security' | 'network';
  description?: string;
}

export interface AssessmentResult {
  assetId: string;
  assetName: string;
  decisionNode: string;
  verdict: 'PASS' | 'FAIL' | 'NOT APPLICABLE';
  justification: string;
  decisionPath: string[];
}

export interface ConceptualAssessmentProps {
  testCaseId: string;
  onComplete: (results: AssessmentResult[]) => void;
}

export const ConceptualAssessment: React.FC<ConceptualAssessmentProps> = ({
  testCaseId,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'assets' | 'assessment'>('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [selectedDecisionNode, setSelectedDecisionNode] = useState<string>('');
  const [, setSelectedOutcome] = useState<string>('');
  
  // Asset entry form state
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    id: '',
    name: '',
    type: 'security',
    description: ''
  });

  // Current assessment state
  const [currentAssessment, setCurrentAssessment] = useState<Partial<AssessmentResult>>({
    decisionNode: '',
    verdict: undefined,
    justification: '',
    decisionPath: []
  });

  const handleAddAsset = () => {
    if (newAsset.id && newAsset.name) {
      const asset: Asset = {
        id: newAsset.id!,
        name: newAsset.name!,
        type: newAsset.type as 'security' | 'network',
        description: newAsset.description || ''
      };
      
      setAssets(prev => [...prev, asset]);
      setNewAsset({ id: '', name: '', type: 'security', description: '' });
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  const handleStartAssessment = () => {
    if (assets.length > 0) {
      setCurrentStep('assessment');
      setCurrentAssetIndex(0);
    }
  };

  const handleDecisionNodeSelect = (nodeId: string, outcome?: string) => {
    setSelectedDecisionNode(nodeId);
    setSelectedOutcome(outcome || '');
    setCurrentAssessment(prev => ({
      ...prev,
      decisionNode: nodeId,
      verdict: outcome as 'PASS' | 'FAIL' | 'NOT APPLICABLE' | undefined
    }));
  };

  const handleSubmitAssessment = () => {
    if (currentAssessment.decisionNode && currentAssessment.verdict && currentAssessment.justification) {
      const result: AssessmentResult = {
        assetId: assets[currentAssetIndex].id,
        assetName: assets[currentAssetIndex].name,
        decisionNode: currentAssessment.decisionNode,
        verdict: currentAssessment.verdict,
        justification: currentAssessment.justification,
        decisionPath: [currentAssessment.decisionNode] // Simplified for now
      };

      setResults(prev => [...prev, result]);

      // Move to next asset or complete
      if (currentAssetIndex < assets.length - 1) {
        setCurrentAssetIndex(prev => prev + 1);
        setCurrentAssessment({
          decisionNode: '',
          verdict: undefined,
          justification: '',
          decisionPath: []
        });
        setSelectedDecisionNode('');
        setSelectedOutcome('');
      } else {
        // All assets completed
        onComplete([...results, result]);
      }
    }
  };

  const currentAsset = assets[currentAssetIndex];

  if (currentStep === 'assets') {
    return (
      <div className="space-y-6">
        <Card title="Step 1: Asset Identification">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Asset Entry Instructions:</h4>
              <p className="text-sm text-blue-800">
                For each security asset and network asset that is accessible by entities, 
                enter the Asset ID and Asset Name. These assets will be individually 
                assessed using the ACM-1 decision tree.
              </p>
            </div>

            {/* Asset Entry Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Asset ID"
                value={newAsset.id || ''}
                onChange={(e) => setNewAsset(prev => ({ ...prev, id: e.target.value }))}
                placeholder="e.g., SA-001, NA-001"
                required
              />
              <Input
                label="Asset Name"
                value={newAsset.name || ''}
                onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Admin Interface, API Endpoint"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type
                </label>
                <select
                  value={newAsset.type || 'security'}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, type: e.target.value as 'security' | 'network' }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="security">Security Asset</option>
                  <option value="network">Network Asset</option>
                </select>
              </div>
              <div>
                <Input
                  label="Description (Optional)"
                  value={newAsset.description || ''}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the asset"
                />
              </div>
            </div>

            <Button
              onClick={handleAddAsset}
              disabled={!newAsset.id || !newAsset.name}
            >
              Add Asset
            </Button>

            {/* Assets List */}
            {assets.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Added Assets ({assets.length}):</h4>
                <div className="space-y-2">
                  {assets.map((asset, index) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={asset.type === 'security' ? 'warning' : 'info'}>
                          {asset.type === 'security' ? 'Security' : 'Network'}
                        </Badge>
                        <div>
                          <span className="font-medium">{asset.id}</span>
                          <span className="text-gray-500 ml-2">- {asset.name}</span>
                          {asset.description && (
                            <div className="text-sm text-gray-600 mt-1">{asset.description}</div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={handleStartAssessment}
                disabled={assets.length === 0}
              >
                Proceed to Assessment ({assets.length} asset{assets.length !== 1 ? 's' : ''})
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={`Step 2: Decision Tree Assessment - Asset ${currentAssetIndex + 1} of ${assets.length}`}>
        <div className="space-y-6">
          {/* Current Asset Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Asset:</h4>
            <div className="flex items-center space-x-4">
              <Badge variant={currentAsset?.type === 'security' ? 'warning' : 'info'}>
                {currentAsset?.type === 'security' ? 'Security Asset' : 'Network Asset'}
              </Badge>
              <span className="font-bold text-lg text-gray-900">{currentAsset?.id}</span>
              <span className="text-gray-600">- {currentAsset?.name}</span>
            </div>
            {currentAsset?.description && (
              <p className="text-sm text-gray-600 mt-2">{currentAsset.description}</p>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progress: {currentAssetIndex + 1} of {assets.length} assets
            </div>
            <div className="flex space-x-2">
              {results.map((result, index) => (
                <Badge
                  key={index}
                  size="sm"
                  variant={
                    result.verdict === 'PASS' ? 'success' :
                    result.verdict === 'FAIL' ? 'error' : 'info'
                  }
                  className="font-bold"
                >
                  <span className="font-bold">{assets.find(a => a.id === result.assetId)?.id}</span>: <span className="font-bold">{result.verdict}</span>
                </Badge>
              ))}
              <Badge size="sm" variant="default" className="font-bold">
                Current: <span className="font-bold">{currentAsset?.id}</span>
              </Badge>
            </div>
          </div>

          {/* Decision Tree */}
          <DecisionTree
            testCaseId={testCaseId}
            onNodeSelect={handleDecisionNodeSelect}
            selectedNode={selectedDecisionNode}
          />

          {/* Assessment Form */}
          <Card title="Assessment Recording">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Decision Node"
                  value={currentAssessment.decisionNode || ''}
                  readOnly
                  placeholder="Click on a decision tree node"
                />
                <Input
                  label="Verdict"
                  value={currentAssessment.verdict || ''}
                  readOnly
                  placeholder="Verdict from selected node"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={currentAssessment.justification || ''}
                  onChange={(e) => setCurrentAssessment(prev => ({ ...prev, justification: e.target.value }))}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Provide detailed justification for the verdict based on the decision tree path and asset characteristics..."
                  required
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep('assets')}
                >
                  Back to Asset List
                </Button>
                
                <Button
                  onClick={handleSubmitAssessment}
                  disabled={
                    !currentAssessment.decisionNode || 
                    !currentAssessment.verdict || 
                    !currentAssessment.justification?.trim()
                  }
                >
                  {currentAssetIndex < assets.length - 1 ? 'Next Asset' : 'Complete Assessment'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          {results.length > 0 && (
            <Card title="Completed Assessments">
              <div className="space-y-2">
                {results.map((result, index) => {
                  const asset = assets.find(a => a.id === result.assetId);
                  return (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg text-gray-900">{asset?.id}</span>
                          <span className="text-gray-600">- {asset?.name}</span>
                        </div>
                        <Badge
                          variant={
                            result.verdict === 'PASS' ? 'success' :
                            result.verdict === 'FAIL' ? 'error' : 'info'
                          }
                          className="font-bold text-sm px-3 py-1"
                        >
                          {result.verdict}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Decision Node:</strong> {result.decisionNode}</div>
                        <div><strong>Justification:</strong> {result.justification}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};