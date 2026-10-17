export type AngleMode = 'DEG' | 'RAD';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  category?: 'calculator' | 'solver' | 'science' | 'calculus' | 'equation';
  details?: string;
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Advanced';

export interface SolutionStep {
  stepNumber: number;
  title: string;
  description: string;
  mathExpression?: string;
  explanation?: string;
}

export interface SolutionMethod {
  name: string;
  description: string;
  steps: SolutionStep[];
  finalAnswer: string;
}

export interface AISolution {
  id: string;
  query: string;
  given: { label: string; value: string; unit?: string }[];
  formulaRequired: string[];
  steps: SolutionStep[];
  substitution: string;
  calculation: string;
  finalAnswer: string;
  unit?: string;
  whyCorrect: string;
  importantNote?: string;
  graphEquation?: string;
  graphType?: 'cartesian' | 'polar' | 'parametric';
  verification?: {
    verified: boolean;
    reason: string;
    details: string;
  };
  alternativeMethods?: SolutionMethod[];
  visualizationType?: 'graph' | 'diagram' | 'vector' | 'geometry' | 'motion' | 'statistics';
  visualizationData?: Record<string, unknown>;
}

export interface QuestionExplanation {
  difficulty: DifficultyLevel;
  whatIsAsking: string;
  givenInfo: string[];
  missingInfo: string[];
  conceptsAndFormulas: string[];
  firstStep: string;
  symbolsMeanings: { symbol: string; meaning: string }[];
  summaryNote: string;
}

export interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  isInequality?: boolean;
  inequalityType?: '<' | '<=' | '>' | '>=';
  label?: string;
}

export interface GraphAnalysis {
  expression: string;
  shape: string;
  xIntercepts: number[];
  yIntercept: number | null;
  extrema: { type: 'minimum' | 'maximum' | 'inflection' | 'vertex'; x: number; y: number }[];
  openingDirection: 'upward' | 'downward' | 'neither' | 'periodic' | 'linear';
  monotonicity: string;
  importantPoints: string[];
  physicalMeaning: string;
}

export interface MatrixData {
  rows: number;
  cols: number;
  data: number[][];
}

