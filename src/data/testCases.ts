import { TestCase } from '../types';

// EN 18031-1 Test Cases
export const en18031_1_testCases: TestCase[] = [
  {
    id: 'acm-001',
    mechanism: 'ACM',
    mechanismNumber: 1,
    assessmentType: 'conceptual',
    title: 'Access Control Mechanism - Conceptual Assessment',
    objective: 'Verify that the access control mechanism is conceptually designed to prevent unauthorized access to radio equipment functionality',
    prerequisites: 'System design documentation, access control specifications, user manual',
    testProcedures: 'Review design documentation to verify access control concepts are properly defined and implemented',
    assessmentUnits: 'Design documents, specifications, user interfaces',
    resultRationale: 'Assessment based on conceptual design review and documentation analysis',
    source: 'EN18031-1',
    section: '5.1.1',
    order: 1,
    testSteps: [
      {
        id: 'acm-001-step-1',
        testCaseId: 'acm-001',
        stepNumber: 1,
        testingProcedure: 'Review system architecture documentation for access control design',
        expectedResult: 'Access control mechanisms are clearly defined and documented',
        order: 1,
      },
      {
        id: 'acm-001-step-2',
        testCaseId: 'acm-001',
        stepNumber: 2,
        testingProcedure: 'Verify user authentication requirements are specified',
        expectedResult: 'Authentication methods and requirements are documented',
        order: 2,
      },
      {
        id: 'acm-001-step-3',
        testCaseId: 'acm-001',
        stepNumber: 3,
        testingProcedure: 'Check authorization levels and permissions structure',
        expectedResult: 'Different user roles and permissions are clearly defined',
        order: 3,
      },
    ],
  },
  {
    id: 'acm-002',
    mechanism: 'ACM',
    mechanismNumber: 2,
    assessmentType: 'functional_completeness',
    title: 'Access Control Mechanism - Functional Completeness',
    objective: 'Verify that all required access control functions are implemented and operational',
    prerequisites: 'Working radio equipment, test user accounts, access control documentation',
    testProcedures: 'Test all access control functions to ensure completeness of implementation',
    assessmentUnits: 'Radio equipment, user interfaces, access control system',
    resultRationale: 'Assessment based on functional testing and verification of all required features',
    source: 'EN18031-1',
    section: '5.1.2',
    order: 2,
    testSteps: [
      {
        id: 'acm-002-step-1',
        testCaseId: 'acm-002',
        stepNumber: 1,
        testingProcedure: 'Test user login functionality with valid credentials',
        expectedResult: 'Users can successfully authenticate with valid credentials',
        order: 1,
      },
      {
        id: 'acm-002-step-2',
        testCaseId: 'acm-002',
        stepNumber: 2,
        testingProcedure: 'Test user login rejection with invalid credentials',
        expectedResult: 'System rejects access attempts with invalid credentials',
        order: 2,
      },
      {
        id: 'acm-002-step-3',
        testCaseId: 'acm-002',
        stepNumber: 3,
        testingProcedure: 'Verify role-based access control functionality',
        expectedResult: 'Different user roles have appropriate access levels',
        order: 3,
      },
    ],
  },
  {
    id: 'aum-001',
    mechanism: 'AUM',
    mechanismNumber: 1,
    assessmentType: 'conceptual',
    title: 'Access Update Mechanism - Conceptual Assessment',
    objective: 'Verify that the access update mechanism is conceptually designed to securely manage access credential updates',
    prerequisites: 'System design documentation, access update specifications',
    testProcedures: 'Review design documentation for access update mechanisms',
    assessmentUnits: 'Design documents, update procedures, security specifications',
    resultRationale: 'Assessment based on conceptual design review of update mechanisms',
    source: 'EN18031-1',
    section: '5.2.1',
    order: 3,
    testSteps: [
      {
        id: 'aum-001-step-1',
        testCaseId: 'aum-001',
        stepNumber: 1,
        testingProcedure: 'Review access credential update procedures in documentation',
        expectedResult: 'Update procedures are clearly documented and secure',
        order: 1,
      },
      {
        id: 'aum-001-step-2',
        testCaseId: 'aum-001',
        stepNumber: 2,
        testingProcedure: 'Verify security measures for credential updates',
        expectedResult: 'Security measures prevent unauthorized updates',
        order: 2,
      },
    ],
  },
  {
    id: 'sum-001',
    mechanism: 'SUM',
    mechanismNumber: 1,
    assessmentType: 'functional_sufficiency',
    title: 'Software Update Mechanism - Functional Sufficiency',
    objective: 'Verify that the software update mechanism provides sufficient security for software updates',
    prerequisites: 'Radio equipment with update capability, test software packages',
    testProcedures: 'Test software update mechanisms for security and integrity',
    assessmentUnits: 'Update system, software packages, verification mechanisms',
    resultRationale: 'Assessment based on testing update security and integrity verification',
    source: 'EN18031-1',
    section: '5.3.1',
    order: 4,
    testSteps: [
      {
        id: 'sum-001-step-1',
        testCaseId: 'sum-001',
        stepNumber: 1,
        testingProcedure: 'Test software update authentication',
        expectedResult: 'Only authenticated software updates are accepted',
        order: 1,
      },
      {
        id: 'sum-001-step-2',
        testCaseId: 'sum-001',
        stepNumber: 2,
        testingProcedure: 'Verify software integrity checking',
        expectedResult: 'System verifies software integrity before installation',
        order: 2,
      },
      {
        id: 'sum-001-step-3',
        testCaseId: 'sum-001',
        stepNumber: 3,
        testingProcedure: 'Test rollback capability for failed updates',
        expectedResult: 'System can rollback failed or corrupted updates',
        order: 3,
      },
    ],
  },
];

// EN 18031-2 Test Cases
export const en18031_2_testCases: TestCase[] = [
  {
    id: 'ssm-001',
    mechanism: 'SSM',
    mechanismNumber: 1,
    assessmentType: 'conceptual',
    title: 'Secure Storage Mechanism - Conceptual Assessment',
    objective: 'Verify that sensitive data storage mechanisms are conceptually designed to protect confidentiality and integrity',
    prerequisites: 'System design documentation, data storage specifications, security requirements',
    testProcedures: 'Review design documentation for secure storage implementation',
    assessmentUnits: 'Storage design, encryption specifications, access control documentation',
    resultRationale: 'Assessment based on design review of storage security mechanisms',
    source: 'EN18031-2',
    section: '6.1.1',
    order: 1,
    testSteps: [
      {
        id: 'ssm-001-step-1',
        testCaseId: 'ssm-001',
        stepNumber: 1,
        testingProcedure: 'Review encryption methods for stored data',
        expectedResult: 'Strong encryption methods are specified for sensitive data',
        order: 1,
      },
      {
        id: 'ssm-001-step-2',
        testCaseId: 'ssm-001',
        stepNumber: 2,
        testingProcedure: 'Verify key management procedures',
        expectedResult: 'Secure key management procedures are documented',
        order: 2,
      },
    ],
  },
  {
    id: 'scm-001',
    mechanism: 'SCM',
    mechanismNumber: 1,
    assessmentType: 'functional_completeness',
    title: 'Secure Communication Mechanism - Functional Completeness',
    objective: 'Verify that secure communication mechanisms provide complete protection for data in transit',
    prerequisites: 'Radio equipment with communication capability, network environment, test data',
    testProcedures: 'Test all secure communication functions and protocols',
    assessmentUnits: 'Communication interfaces, encryption protocols, network security',
    resultRationale: 'Assessment based on functional testing of communication security',
    source: 'EN18031-2',
    section: '6.2.1',
    order: 2,
    testSteps: [
      {
        id: 'scm-001-step-1',
        testCaseId: 'scm-001',
        stepNumber: 1,
        testingProcedure: 'Test encrypted communication establishment',
        expectedResult: 'Secure communication channels are properly established',
        order: 1,
      },
      {
        id: 'scm-001-step-2',
        testCaseId: 'scm-001',
        stepNumber: 2,
        testingProcedure: 'Verify data encryption during transmission',
        expectedResult: 'All sensitive data is encrypted during transmission',
        order: 2,
      },
      {
        id: 'scm-001-step-3',
        testCaseId: 'scm-001',
        stepNumber: 3,
        testingProcedure: 'Test communication integrity verification',
        expectedResult: 'System detects and handles communication integrity violations',
        order: 3,
      },
    ],
  },
];

export const getAllTestCases = (): TestCase[] => {
  return [...en18031_1_testCases, ...en18031_2_testCases];
};

export const getTestCasesByStandard = (standard: 'EN18031-1' | 'EN18031-2'): TestCase[] => {
  return standard === 'EN18031-1' ? en18031_1_testCases : en18031_2_testCases;
};

export const getTestCasesByMechanism = (mechanism: string): TestCase[] => {
  return getAllTestCases().filter(tc => tc.mechanism === mechanism);
};

export const getTestCaseById = (id: string): TestCase | undefined => {
  return getAllTestCases().find(tc => tc.id === id);
};