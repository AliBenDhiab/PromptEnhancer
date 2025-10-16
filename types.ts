export interface PromptOptimizationResult {
  short: string;
  standard: string;
  expanded: string;
}

export interface PdfSummaryStructuredResult {
  title: string;
  main_topics: string[];
  action_items: string[];
}

export interface PdfSummaryResult {
  summary: string;
  keyPoints: string[];
  structured: PdfSummaryStructuredResult;
}

export type SummaryLength = 'موجز' | 'متوسط' | 'مفصل';

// --- History Types ---

export interface OptimizerHistory {
  type: 'optimizer';
  input: string;
  result: PromptOptimizationResult;
}

export interface SummarizerHistory {
  type: 'summarizer';
  input: string; // Filename
  result: PdfSummaryResult;
}

export type HistoryItem = (OptimizerHistory | SummarizerHistory) & {
  id: string;
  timestamp: string;
};
