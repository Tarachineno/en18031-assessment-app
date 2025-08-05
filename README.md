# EN 18031 Assessment Application

A comprehensive web application for conducting security assessments based on EN 18031-1 and EN 18031-2 standards. This application provides interactive decision trees, conceptual assessments, and detailed reporting capabilities for cybersecurity evaluation.

## 🚀 Features

### Core Assessment Capabilities
- **Complete EN 18031 Coverage**: Implements all 73 mechanisms from EN 18031-1 (31 mechanisms) and EN 18031-2 (42 mechanisms)
- **Interactive Decision Trees**: PlantUML-style decision trees with proper UML notation
- **Conceptual Assessment Workflow**: Two-step assessment process with asset identification and decision tree evaluation
- **Assessment Result Management**: Full CRUD operations (Create, Read, Update, Delete) for assessment results

### Enhanced Decision Tree Features
- **Standard UML Shapes**: Rectangle shapes for all nodes (decisions and outcomes)
- **PlantUML Styling**: Professional appearance with Utopia font and proper color coding
- **Interactive Navigation**: Click-based node selection with visual feedback
- **Proper Connections**: Clean arrow-based connections with Yes/No path labels

### Assessment Management
- **Multi-Asset Support**: Assess multiple security and network assets in a single session
- **Bold Visual Hierarchy**: Enhanced formatting with bold Asset IDs and Verdicts
- **Edit/Delete Functionality**: Modify or remove past assessment results
- **Decision Node Recording**: Proper DT node IDs (e.g., DT.ACM-1.DN-1) instead of outcome node IDs
- **Duplicate Detection**: Automatic detection and prevention of duplicate assessment imports

### Technical Features
- **React 18 + TypeScript**: Modern development stack with type safety
- **Zustand State Management**: Efficient state management with localStorage persistence
- **SVG-based Rendering**: Crisp, scalable graphics for decision trees
- **Responsive Design**: Tailwind CSS for clean, professional UI

## 🏗️ Architecture

### Key Components
- `/src/components/assessment/DecisionTree.tsx` - Interactive PlantUML-style decision tree
- `/src/components/assessment/ConceptualAssessment.tsx` - Two-step assessment workflow
- `/src/components/assessment/AssessmentExecution.tsx` - Main assessment interface with CRUD operations
- `/src/data/testCases.ts` - Complete EN 18031 mechanism definitions
- `/src/stores/assessmentStore.ts` - State management with persistence

### Decision Tree Implementation
The decision tree uses SVG-based rendering with proper UML notation:

```typescript
// Rectangle shapes for all nodes
<rect
  width={200}
  height={80}
  rx={8}
  fill={fillColor}
  stroke="#000000"
  strokeWidth={1}
/>

// PlantUML-style connections
<line
  stroke="#000000"
  strokeWidth="1"
  markerEnd="url(#arrowhead-black)"
/>
```

## 🎯 Assessment Workflow

### ACM-1 Conceptual Assessment
1. **Step 1: Asset Identification**
   - Enter Asset ID and Asset Name
   - Select asset type (Security/Network)
   - Add optional description

2. **Step 2: Decision Tree Assessment**
   - Navigate through interactive decision tree
   - Answer questions for each decision node
   - Record verdict with proper DT node ID
   - Provide detailed justification

### Supported Mechanisms
- **ACM (Access Control Mechanisms)**: 6 test cases
- **AUM (Authentication Mechanisms)**: 4 test cases
- **SUM (Software Update Mechanisms)**: 8 test cases
- **SSM (Secure Storage Mechanisms)**: 6 test cases
- **SCM (Secure Communication Mechanisms)**: 12 test cases
- **RLM (Resilience Mechanisms)**: 4 test cases
- **NMM (Network Management Mechanisms)**: 4 test cases
- **TCM (Trusted Computing Mechanisms)**: 6 test cases
- **CCK (Cryptographic Key Management)**: 8 test cases
- **GEC (General Cryptographic Mechanisms)**: 4 test cases
- **CRY (Advanced Cryptographic Mechanisms)**: 4 test cases
- **LGM (Logging Mechanisms)**: 3 test cases
- **DLM (Data Loss Prevention)**: 2 test cases
- **UNM (Unique Identification)**: 2 test cases

## 🛠️ Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd en18031-assessment-fresh

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

#### `npm run build`
Builds the app for production to the `build` folder

#### `npm test`
Launches the test runner in interactive watch mode

## 📊 Data Management

### Local Storage
Assessment data is persisted in localStorage:
- `assessment-store`: Assessment results and state
- `project-store`: Project information
- `evidence-store`: Evidence and supporting documentation

### Import/Export with Duplicate Detection
The application supports importing and exporting assessment data in multiple formats:

#### Supported Formats
- **JSON**: Complete project data with full structure
- **CSV**: Assessment data in spreadsheet format  
- **XML**: Structured project data for integration
- **PDF**: Professional report document (export only)
- **Markdown**: Human-readable documentation (export only)

#### Duplicate Detection Features
- **Content-based Comparison**: Compares assessment content (test results, justifications, step results) while ignoring metadata like IDs and timestamps
- **Automatic Skip Option**: Choose to automatically skip duplicate assessments during import
- **Visual Feedback**: Clear warnings when duplicates are detected with detailed summary
- **Selective Import**: Import only unique assessments while preventing data duplication

#### Using Import/Export
1. Navigate to a project and click "Import/Export" 
2. Choose your desired format
3. For imports: Select duplicate handling preference (skip duplicates recommended)
4. Upload your file - duplicates will be automatically detected and reported
5. Review the import summary for any detected duplicates

### Reset Data
Use the browser console to reset all data:
```javascript
resetAssessmentData()
```

## 🎨 Visual Design

### PlantUML Style Decision Tree
- **Rectangle Shapes**: All nodes use consistent rectangle shapes
- **Color Coding**: 
  - Green (#90EE90) for PASS outcomes
  - Pink (#FFC0CB) for FAIL outcomes  
  - Light Purple (#E6E6FA) for NOT APPLICABLE outcomes
- **Typography**: Utopia serif font (11px) for professional appearance
- **Clean Connections**: Black arrows with proper Yes/No labels

### Enhanced UI Elements
- **Bold Asset IDs**: `font-bold text-lg` for prominence
- **Bold Verdicts**: Enhanced badge styling with bold text
- **Visual Hierarchy**: Clear organization of assessment information
- **Interactive Elements**: Hover effects and selection states

## 🔧 Technical Implementation

### State Management
```typescript
// Zustand store with persistence
export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      assessments: [],
      createAssessment: async (data, projectId) => { /* ... */ },
      updateAssessment: async (id, data) => { /* ... */ },
      deleteAssessment: async (id) => { /* ... */ },
    }),
    { name: 'assessment-store' }
  )
)
```

### Decision Tree Data Structure
```typescript
interface DecisionNode {
  id: string;           // DT.ACM-1.DN-1
  label: string;        // Display label
  question: string;     // Decision question
  type: 'decision' | 'outcome';
  outcome?: 'PASS' | 'FAIL' | 'NOT APPLICABLE';
  yesPath?: string;     // Next node for Yes
  noPath?: string;      // Next node for No
  position: { x: number; y: number };
}
```

## 📈 Recent Enhancements

### Version 2.1 Features
- ✅ **Duplicate Detection System**: Advanced content-based duplicate detection for assessment imports
- ✅ **Smart Import Options**: Choose to skip or include duplicate assessments during import
- ✅ **Enhanced Import/Export UI**: Visual feedback for duplicate detection with detailed summaries
- ✅ **Content Hash Algorithm**: Secure comparison of assessment content while preserving data integrity

### Version 2.0 Features
- ✅ Complete EN 18031 mechanism coverage (73 total)
- ✅ PlantUML-style decision tree implementation
- ✅ Rectangle shapes for all decision and outcome nodes
- ✅ Enhanced two-step conceptual assessment workflow
- ✅ Edit/Delete functionality for assessment results
- ✅ Bold formatting for Asset IDs and Verdicts
- ✅ Proper DT node ID recording (DT.ACM-1.DN-1 format)
- ✅ Clean verdict displays without explanatory text
- ✅ Fixed Equipment to DN-1 connection alignment

## 🤝 Contributing

This application is designed for cybersecurity professionals conducting EN 18031 assessments. Contributions should maintain compliance with the official EN 18031-1 and EN 18031-2 standards.

## 📄 License

This project is designed for professional cybersecurity assessment purposes in accordance with EN 18031 standards.