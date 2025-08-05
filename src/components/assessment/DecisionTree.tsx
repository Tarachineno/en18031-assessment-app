import React, { useState } from 'react';
import { Card, Button } from '../common';

export interface DecisionNode {
  id: string;
  label: string;
  question: string;
  type: 'decision' | 'outcome';
  outcome?: 'PASS' | 'FAIL' | 'NOT APPLICABLE';
  yesPath?: string;
  noPath?: string;
  position: { x: number; y: number };
}

export interface DecisionTreeProps {
  testCaseId: string;
  onNodeSelect?: (nodeId: string, outcome?: string) => void;
  selectedNode?: string;
}

// ACM-1 Decision Tree Data - PlantUML Style Layout
const acm1DecisionTree: DecisionNode[] = [
  {
    id: 'DT.ACM-1.DN-1',
    label: 'DT.ACM-1.DN-1',
    question: 'Is the public accessibility of the asset the equipment\'s intended functionality?',
    type: 'decision',
    yesPath: 'DT.ACM-1.DN-2',
    noPath: 'NOT_APPLICABLE_1',
    position: { x: 400, y: 120 }
  },
  {
    id: 'NOT_APPLICABLE_1',
    label: 'NOT APPLICABLE',
    question: '',
    type: 'outcome',
    outcome: 'NOT APPLICABLE',
    position: { x: 100, y: 280 }
  },
  {
    id: 'DT.ACM-1.DN-2',
    label: 'DT.ACM-1.DN-2',
    question: 'Do the physical or logical measures in the targeted operational environment limit the accessibility to authorized entities?',
    type: 'decision',
    yesPath: 'NOT_APPLICABLE_2',
    noPath: 'DT.ACM-1.DN-3',
    position: { x: 700, y: 280 }
  },
  {
    id: 'NOT_APPLICABLE_2',
    label: 'NOT APPLICABLE',
    question: '',
    type: 'outcome',
    outcome: 'NOT APPLICABLE',
    position: { x: 500, y: 440 }
  },
  {
    id: 'DT.ACM-1.DN-3',
    label: 'DT.ACM-1.DN-3',
    question: 'Do legal implications not allow access control mechanisms?',
    type: 'decision',
    yesPath: 'NOT_APPLICABLE_3',
    noPath: 'DT.ACM-1.DN-4',
    position: { x: 1000, y: 440 }
  },
  {
    id: 'NOT_APPLICABLE_3',
    label: 'NOT APPLICABLE',
    question: '',
    type: 'outcome',
    outcome: 'NOT APPLICABLE',
    position: { x: 800, y: 600 }
  },
  {
    id: 'DT.ACM-1.DN-4',
    label: 'DT.ACM-1.DN-4',
    question: 'Are there access control mechanisms that manage entities\' access to the security assets and network assets?',
    type: 'decision',
    yesPath: 'PASS',
    noPath: 'FAIL',
    position: { x: 1300, y: 600 }
  },
  {
    id: 'PASS',
    label: 'PASS',
    question: '',
    type: 'outcome',
    outcome: 'PASS',
    position: { x: 1150, y: 760 }
  },
  {
    id: 'FAIL',
    label: 'FAIL',
    question: '',
    type: 'outcome',
    outcome: 'FAIL',
    position: { x: 1450, y: 760 }
  }
];

export const DecisionTree: React.FC<DecisionTreeProps> = ({ 
  testCaseId, 
  onNodeSelect, 
  selectedNode 
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const getNodeById = (id: string) => {
    return acm1DecisionTree.find(node => node.id === id);
  };

  const handleNodeClick = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (node && onNodeSelect) {
      // For outcome nodes, find the decision node that leads to this outcome
      if (node.type === 'outcome') {
        const parentDecisionNode = acm1DecisionTree.find(decisionNode => 
          decisionNode.type === 'decision' && 
          (decisionNode.yesPath === nodeId || decisionNode.noPath === nodeId)
        );
        
        if (parentDecisionNode) {
          // Record the decision node ID, not the outcome node ID
          onNodeSelect(parentDecisionNode.id, node.outcome);
          setCurrentPath(prev => [...prev, nodeId]);
        }
      } else {
        // For decision nodes, just record the node itself
        onNodeSelect(nodeId, node.outcome);
        setCurrentPath(prev => [...prev, nodeId]);
      }
    }
  };

  const renderPlantUMLNode = (node: DecisionNode) => {
    const isSelected = selectedNode === node.id;
    const isInPath = currentPath.includes(node.id);
    
    if (node.type === 'decision') {
      // All decision nodes (DN-1, DN-2, DN-3, DN-4) use rectangle shape
      const rectWidth = 200;
      const rectHeight = 80;
      const strokeColor = isSelected ? '#2563eb' : '#000000';
      const fillColor = isSelected ? '#e0f2fe' : '#ffffff';
      const strokeWidth = isSelected ? 2 : 1;
      
      return (
        <g key={node.id}>
          <rect
            width={rectWidth}
            height={rectHeight}
            rx={8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            className="cursor-pointer transition-all duration-200"
            onClick={() => handleNodeClick(node.id)}
          />
          {/* Node label */}
          <text
            x={rectWidth/2}
            y={18}
            textAnchor="middle"
            className="text-xs font-bold fill-gray-800 pointer-events-none select-none"
            style={{ fontFamily: 'Utopia, serif' }}
          >
            {node.label}
          </text>
          {/* Question text */}
          {node.question && (
            <foreignObject
              x={8}
              y={22}
              width={rectWidth - 16}
              height={rectHeight - 24}
              className="pointer-events-none"
            >
              <div 
                className="text-xs text-center leading-tight text-gray-800"
                style={{ fontFamily: 'Utopia, serif', fontSize: '11px' }}
              >
                {node.question}
              </div>
            </foreignObject>
          )}
        </g>
      );
    } else {
      // PlantUML-style rounded rectangle for outcomes
      const rectWidth = 160;
      const rectHeight = 60;
      let fillColor, strokeColor, textColor;
      
      switch (node.outcome) {
        case 'PASS':
          fillColor = '#90EE90'; // lightgreen
          strokeColor = '#000000';
          textColor = '#000000';
          break;
        case 'FAIL':
          fillColor = '#FFC0CB'; // pink
          strokeColor = '#000000';
          textColor = '#000000';
          break;
        case 'NOT APPLICABLE':
          fillColor = '#E6E6FA'; // application color (light purple)
          strokeColor = '#000000';
          textColor = '#000000';
          break;
        default:
          fillColor = '#f3f4f6';
          strokeColor = '#000000';
          textColor = '#000000';
      }
      
      return (
        <g key={node.id}>
          <rect
            width={rectWidth}
            height={rectHeight}
            rx={8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={1}
            className="cursor-pointer transition-all duration-200"
            onClick={() => handleNodeClick(node.id)}
          />
          {/* Outcome text with PlantUML style */}
          <text
            x={rectWidth/2}
            y={rectHeight/2 + 5}
            textAnchor="middle"
            className="text-sm font-bold pointer-events-none select-none"
            style={{ 
              fontFamily: 'Utopia, serif', 
              fontSize: '11px',
              fill: textColor
            }}
          >
            {node.outcome}
          </text>
        </g>
      );
    }
  };

  const renderPlantUMLConnections = () => {
    return acm1DecisionTree.map(node => {
      if (node.type === 'decision') {
        const yesTarget = getNodeById(node.yesPath!);
        const noTarget = getNodeById(node.noPath!);
        
        // All decision nodes are now rectangles
        const decisionRectWidth = 200;
        const decisionRectHeight = 80;
        const outcomeRectWidth = 160;
        
        const startX = node.position.x + decisionRectWidth / 2;
        const startY = node.position.y + decisionRectHeight;
        
        return (
          <g key={`${node.id}-connections`}>
            {/* Yes path */}
            {yesTarget && (
              <>
                <line
                  x1={startX}
                  y1={startY}
                  x2={yesTarget.position.x + (yesTarget.type === 'outcome' ? outcomeRectWidth / 2 : decisionRectWidth / 2)}
                  y2={yesTarget.position.y}
                  stroke="#000000"
                  strokeWidth="1"
                  markerEnd="url(#arrowhead-black)"
                />
                <text
                  x={(startX + yesTarget.position.x + (yesTarget.type === 'outcome' ? outcomeRectWidth / 2 : decisionRectWidth / 2)) / 2 + 10}
                  y={(startY + yesTarget.position.y) / 2 - 5}
                  fill="#000000"
                  fontSize="11"
                  fontWeight="normal"
                  textAnchor="middle"
                  className="select-none"
                  style={{ fontFamily: 'Utopia, serif' }}
                >
                  Yes
                </text>
              </>
            )}
            
            {/* No path */}
            {noTarget && (
              <>
                <line
                  x1={startX}
                  y1={startY}
                  x2={noTarget.position.x + (noTarget.type === 'outcome' ? outcomeRectWidth / 2 : decisionRectWidth / 2)}
                  y2={noTarget.position.y}
                  stroke="#000000"
                  strokeWidth="1"
                  markerEnd="url(#arrowhead-black)"
                />
                <text
                  x={(startX + noTarget.position.x + (noTarget.type === 'outcome' ? outcomeRectWidth / 2 : decisionRectWidth / 2)) / 2 - 10}
                  y={(startY + noTarget.position.y) / 2 - 5}
                  fill="#000000"
                  fontSize="11"
                  fontWeight="normal"
                  textAnchor="middle"
                  className="select-none"
                  style={{ fontFamily: 'Utopia, serif' }}
                >
                  No
                </text>
              </>
            )}
          </g>
        );
      }
      return null;
    });
  };

  return (
    <Card title="Decision Tree - ACM-1">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to use the Decision Tree:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Start with DT.ACM-1.DN-1 and answer the question for your specific asset</li>
            <li>2. Follow the Yes/No paths based on your answers</li>
            <li>3. Click on the final outcome node (PASS, FAIL, or NOT APPLICABLE)</li>
            <li>4. Record the decision path and justification in Step 2</li>
          </ol>
        </div>

        <div className="relative overflow-x-auto">
          <div className="relative w-[1800px] h-[950px] border border-gray-200 rounded-lg bg-white">
            {/* Start indicator */}
            <div className="absolute top-8" style={{ left: '460px' }}>
              <div className="bg-gray-100 border-2 border-gray-400 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                Equipment
              </div>
            </div>

            {/* SVG for PlantUML-style decision tree */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <marker
                  id="arrowhead-black"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    fill="#000000"
                  />
                </marker>
              </defs>
              
              {/* Connection from Equipment to DT.ACM-1.DN-1 */}
              <line
                x1="500"
                y1="50"
                x2="500"
                y2="120"
                stroke="#000000"
                strokeWidth="1"
                markerEnd="url(#arrowhead-black)"
              />
              
              {/* PlantUML-style Connections */}
              {renderPlantUMLConnections()}
              
              {/* PlantUML-style Decision nodes */}
              {acm1DecisionTree.map(node => (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.position.x}, ${node.position.y})`}
                >
                  {renderPlantUMLNode(node)}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {selectedNode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Selected Decision Node:</h4>
            <p className="text-sm text-yellow-800">
              <strong>{selectedNode}</strong>
              {getNodeById(selectedNode) && (
                <span className="ml-2">
                  → Question: <em>{getNodeById(selectedNode)?.question}</em>
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentPath([]);
              if (onNodeSelect) onNodeSelect('', undefined);
            }}
          >
            Reset Path
          </Button>
        </div>
      </div>
    </Card>
  );
};