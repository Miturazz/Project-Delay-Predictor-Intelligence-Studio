export type ProjectDomain = 
  | 'Aerospace & Defense'
  | 'Enterprise ERP & Core'
  | 'FinTech & Banking'
  | 'Healthcare & Life Sciences'
  | 'Cloud & Infrastructure'
  | 'Megaproject & Transit';

export interface ProjectData {
  id: string;
  projectName: string;
  domain: ProjectDomain;
  // Historical Project Management Data
  plannedDurationMonths: number; // 6 to 60
  budgetMillions: number; // 1 to 250
  requirementsVolatility: number; // 0 to 100 (% churn)
  dependencyCount: number; // 0 to 40 external dependencies
  techNoveltyRisk: number; // 1 to 5 (1 = legacy/standard, 5 = frontier/untried)
  earlyMilestoneSlippage: number; // -15% to +60% (early slippage at 25% timeline)
  // Team Productivity Metrics
  sprintVelocity: number; // story points or deliverables per engineer/mo (10 to 60)
  velocityReliability: number; // % of committed sprint deliverables shipped (50% to 100%)
  overtimeHoursPerWeek: number; // weekly overtime (0 to 30 hrs/wk)
  approvalLatencyDays: number; // PR / code review turnaround (0.5 to 10 days)
  stakeholderLatencyDays: number; // leadership/client sign-off delay (1 to 45 days)
  // Team Size & Organizational Structure Metrics
  teamSize: number; // Core FTEs (4 to 350)
  seniorJuniorRatio: number; // Ratio of senior/lead to junior engineers (0.05 to 0.9)
  annualAttritionRate: number; // Annualized team turnover % (2% to 45%)
  newHireRampRatio: number; // % of team hired in last 90 days (0% to 65%)
  podModularity: number; // 1 to 5 (1 = monolithic 1 giant team, 5 = autonomous decoupled two-pizza pods)
  
  // Computed / Target Metrics
  brooksOverheadIndex: number; // Normalized Brooks' Law communication complexity
  isDelayed: 0 | 1; // 1 = Delayed, 0 = On-Time / Early
  actualDelayMonths: number; // Slippage in months (0 if on-time, >0 if delayed)
  completionStatus: 'On-Time' | 'Delayed';
}

export type MLModelType = 'gbdt' | 'random_forest' | 'logistic_regression' | 'ensemble';

export interface ModelHyperparameters {
  learningRate: number; // 0.01 to 0.3
  maxDepth: number; // 2 to 8
  numEstimators: number; // 10 to 100
  regularizationL2: number; // 0.001 to 1.0
  decisionThreshold: number; // 0.1 to 0.9 (default 0.5)
  trainTestSplit: number; // 0.6 to 0.9 (default 0.8)
  minSamplesSplit: number; // 2 to 10
}

export interface EpochProgress {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  accuracy: number;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
  rocAuc: number;
  prAuc: number;
  mcc: number; // Matthews correlation coefficient
  logLoss: number;
  trainingHistory: EpochProgress[];
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    total: number;
  };
  rocCurve: Array<{ fpr: number; tpr: number; threshold: number }>;
  prCurve: Array<{ recall: number; precision: number; threshold: number }>;
}

export interface FeatureImportance {
  featureKey: keyof ProjectData;
  label: string;
  category: 'Productivity' | 'Team Size' | 'Project Management';
  importance: number; // 0 to 1 normalized
  direction: 'increases_delay' | 'decreases_delay';
  description: string;
}

export interface LocalExplanation {
  featureKey: string;
  label: string;
  category: 'Productivity' | 'Team Size' | 'Project Management';
  currentValue: string | number;
  baselineValue: string | number;
  attribution: number; // positive = pushes toward delay, negative = pushes toward on-time
  impactDescription: string;
}

export interface PredictionResult {
  delayProbability: number; // 0.0 to 1.0
  predictedStatus: 'On-Time' | 'Delayed';
  predictedDelayMonths: number;
  riskTier: 'Minimal Risk' | 'Moderate Risk' | 'Elevated Risk' | 'Critical Delay Risk';
  confidenceScore: number;
  brooksIndex: number;
  localExplanations: LocalExplanation[];
  recommendedInterventions: PrescriptiveIntervention[];
}

export interface PrescriptiveIntervention {
  title: string;
  category: 'Productivity' | 'Team Structure' | 'Scope & Governance';
  action: string;
  projectedRiskReduction: number; // e.g. -22%
  newDelayProbability: number;
  feasibility: 'High' | 'Medium' | 'Strategic';
}

export interface PartialDependencePoint {
  value: number;
  delayProbability: number;
}

export interface PartialDependenceData {
  featureKey: keyof ProjectData;
  label: string;
  points: PartialDependencePoint[];
  currentValue: number;
  safeThreshold: number;
  warningThreshold: number;
}
