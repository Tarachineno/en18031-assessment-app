# Changelog

All notable changes to the EN 18031 Assessment Application will be documented in this file.

## [2.0.0] - 2025-08-02

### 🚀 Major Features

#### Complete EN 18031 Implementation
- **Added**: Complete coverage of all 73 mechanisms from EN 18031-1 and EN 18031-2 standards
- **Expanded**: From 23 to 73 test cases covering all mechanism categories
- **Enhanced**: Test case definitions with proper objectives, procedures, and assessment units

#### PlantUML-Style Decision Tree
- **Implemented**: Professional PlantUML-style decision tree visualization
- **Added**: SVG-based rendering for crisp, scalable graphics
- **Enhanced**: Rectangle shapes for all nodes (decision and outcome nodes)
- **Styled**: Utopia serif font and proper PlantUML color scheme
- **Improved**: Clean black arrows with proper Yes/No path labels

#### Enhanced Assessment Workflow
- **Added**: Two-step conceptual assessment process for ACM-1
- **Step 1**: Asset identification with ID, name, type, and description
- **Step 2**: Interactive decision tree assessment with verdict recording
- **Enhanced**: Multi-asset support within single assessment sessions

### 🎨 Visual Improvements

#### Decision Tree Design
- **Changed**: All decision nodes from diamond to rectangle shapes
- **Standardized**: Consistent rectangle shapes (200x80px for decisions, 160x60px for outcomes)
- **Applied**: PlantUML color coding:
  - Green (#90EE90) for PASS outcomes
  - Pink (#FFC0CB) for FAIL outcomes
  - Light Purple (#E6E6FA) for NOT APPLICABLE outcomes
- **Fixed**: Equipment to DT.ACM-1.DN-1 connection alignment
- **Removed**: Unnecessary explanatory text from verdict outcomes

#### Enhanced UI Elements
- **Added**: Bold formatting for Asset IDs (`font-bold text-lg`)
- **Enhanced**: Bold formatting for Verdicts in assessment results
- **Improved**: Visual hierarchy throughout the application
- **Added**: Progress indicators with bold formatting
- **Enhanced**: Assessment result cards with better typography

### 🔧 Technical Improvements

#### Assessment Management
- **Added**: Full CRUD operations (Create, Read, Update, Delete) for assessment results
- **Implemented**: Edit modal for modifying existing assessments
- **Added**: Delete confirmation with proper error handling
- **Enhanced**: Assessment result display with Asset ID headers

#### Decision Tree Logic
- **Fixed**: Decision node recording to use proper DT node IDs (e.g., DT.ACM-1.DN-1)
- **Changed**: From outcome node IDs to parent decision node IDs
- **Improved**: Node selection logic for better user experience
- **Added**: Interactive node highlighting and path tracking

#### Data Structure Enhancements
- **Extended**: AssessmentResult interface to include asset names
- **Improved**: Assessment data persistence with localStorage
- **Added**: Data reset utility accessible via console (`resetAssessmentData()`)
- **Enhanced**: State management with Zustand and persistence

### 📊 Assessment Features

#### Mechanism Coverage
- **ACM (Access Control)**: 6 test cases including conceptual assessment
- **AUM (Authentication)**: 4 test cases
- **SUM (Software Update)**: 8 test cases  
- **SSM (Secure Storage)**: 6 test cases
- **SCM (Secure Communication)**: 12 test cases
- **RLM (Resilience)**: 4 test cases
- **NMM (Network Management)**: 4 test cases
- **TCM (Trusted Computing)**: 6 test cases
- **CCK (Cryptographic Keys)**: 8 test cases
- **GEC (General Crypto)**: 4 test cases
- **CRY (Advanced Crypto)**: 4 test cases
- **LGM (Logging)**: 3 test cases
- **DLM (Data Loss Prevention)**: 2 test cases
- **UNM (Unique Identification)**: 2 test cases

#### Assessment Process
- **Enhanced**: Asset entry with validation
- **Improved**: Decision tree navigation
- **Added**: Justification recording with proper formatting
- **Enhanced**: Results summary with asset information
- **Added**: Assessment editing and deletion capabilities

### 🐛 Bug Fixes

- **Fixed**: Connection alignment between Equipment starter and first decision node
- **Resolved**: Modal backdrop click behavior
- **Fixed**: Decision tree duplicate verdict displays
- **Corrected**: Decision node format in assessment results
- **Fixed**: TypeScript compilation warnings
- **Resolved**: Import path issues

### 🔄 Code Quality

#### Architecture
- **Refactored**: Decision tree rendering with modular components
- **Improved**: Type safety with proper TypeScript interfaces
- **Enhanced**: Component reusability and maintainability
- **Added**: Proper error handling throughout the application

#### Performance
- **Optimized**: SVG rendering for better performance
- **Improved**: State management efficiency
- **Enhanced**: Component rendering with proper memoization
- **Optimized**: Bundle size and loading performance

### 📝 Documentation

- **Updated**: Comprehensive README with all new features
- **Added**: Technical implementation details
- **Documented**: Assessment workflow and procedures
- **Added**: Architecture and component documentation
- **Enhanced**: Setup and installation instructions

### 🗂️ File Structure Changes

#### New Components
- `src/components/assessment/DecisionTree.tsx` - PlantUML-style decision tree
- `src/components/assessment/ConceptualAssessment.tsx` - Two-step assessment workflow
- `src/components/assessment/EditAssessmentModal.tsx` - Assessment editing interface
- `src/utils/resetData.ts` - Data reset utility

#### Enhanced Components
- `src/components/assessment/AssessmentExecution.tsx` - Enhanced with CRUD operations
- `src/data/testCases.ts` - Complete EN 18031 mechanism coverage
- `src/stores/assessmentStore.ts` - Enhanced state management
- `src/types/index.ts` - Updated type definitions

### 🚀 Deployment

- **Ready**: Production build with optimized performance
- **Enhanced**: Development workflow with proper build scripts
- **Added**: Environment configuration for different deployment targets
- **Optimized**: Asset bundling and minification

---

## [1.0.0] - Initial Release

### 🎯 Initial Features
- Basic EN 18031 assessment framework
- Simple decision tree implementation
- Basic assessment recording
- React + TypeScript foundation
- Initial UI components

---

**Legend:**
- 🚀 Major Features
- 🎨 Visual Improvements  
- 🔧 Technical Improvements
- 📊 Assessment Features
- 🐛 Bug Fixes
- 🔄 Code Quality
- 📝 Documentation
- 🗂️ File Structure
- 🚀 Deployment