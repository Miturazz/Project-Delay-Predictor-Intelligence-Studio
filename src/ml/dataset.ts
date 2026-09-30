import { ProjectData, ProjectDomain } from '../types/ml';

// Seeded pseudo-random generator for reproducible enterprise data
class SeededRandom {
  private s: number;
  constructor(seed = 42) {
    this.s = seed % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  gaussian(mean = 0, stdev = 1): number {
    let u1 = this.next();
    let u2 = this.next();
    while (u1 === 0) u1 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdev;
  }
}

export const DOMAINS: ProjectDomain[] = [
  'Aerospace & Defense',
  'Enterprise ERP & Core',
  'FinTech & Banking',
  'Healthcare & Life Sciences',
  'Cloud & Infrastructure',
  'Megaproject & Transit',
];

export const PRESET_PROJECTS: ProjectData[] = [
  {
    id: 'case-01',
    projectName: 'Project Apollo: Global SAP S/4HANA Migration',
    domain: 'Enterprise ERP & Core',
    plannedDurationMonths: 24,
    budgetMillions: 45.0,
    requirementsVolatility: 48,
    dependencyCount: 18,
    techNoveltyRisk: 4,
    earlyMilestoneSlippage: 22,
    sprintVelocity: 26,
    velocityReliability: 68,
    overtimeHoursPerWeek: 16,
    approvalLatencyDays: 6.5,
    stakeholderLatencyDays: 24,
    teamSize: 85,
    seniorJuniorRatio: 0.18,
    annualAttritionRate: 26,
    newHireRampRatio: 38,
    podModularity: 2,
    brooksOverheadIndex: 0.88,
    isDelayed: 1,
    actualDelayMonths: 8.5,
    completionStatus: 'Delayed',
  },
  {
    id: 'case-02',
    projectName: 'Falcon: Core Retail Banking Ledger Revamp',
    domain: 'FinTech & Banking',
    plannedDurationMonths: 18,
    budgetMillions: 28.5,
    requirementsVolatility: 62,
    dependencyCount: 22,
    techNoveltyRisk: 3,
    earlyMilestoneSlippage: 30,
    sprintVelocity: 31,
    velocityReliability: 64,
    overtimeHoursPerWeek: 18,
    approvalLatencyDays: 5.2,
    stakeholderLatencyDays: 28,
    teamSize: 110,
    seniorJuniorRatio: 0.22,
    annualAttritionRate: 24,
    newHireRampRatio: 42,
    podModularity: 2,
    brooksOverheadIndex: 0.94,
    isDelayed: 1,
    actualDelayMonths: 7.2,
    completionStatus: 'Delayed',
  },
  {
    id: 'case-03',
    projectName: 'Hyperion: Next-Gen Zero-Trust Cloud Platform',
    domain: 'Cloud & Infrastructure',
    plannedDurationMonths: 14,
    budgetMillions: 12.0,
    requirementsVolatility: 18,
    dependencyCount: 6,
    techNoveltyRisk: 2,
    earlyMilestoneSlippage: -4,
    sprintVelocity: 44,
    velocityReliability: 92,
    overtimeHoursPerWeek: 4,
    approvalLatencyDays: 1.2,
    stakeholderLatencyDays: 4,
    teamSize: 32,
    seniorJuniorRatio: 0.48,
    annualAttritionRate: 6,
    newHireRampRatio: 12,
    podModularity: 4,
    brooksOverheadIndex: 0.22,
    isDelayed: 0,
    actualDelayMonths: 0,
    completionStatus: 'On-Time',
  },
  {
    id: 'case-04',
    projectName: 'Artemis: Telemetry Avionics Flight Control',
    domain: 'Aerospace & Defense',
    plannedDurationMonths: 36,
    budgetMillions: 88.0,
    requirementsVolatility: 14,
    dependencyCount: 28,
    techNoveltyRisk: 4,
    earlyMilestoneSlippage: 12,
    sprintVelocity: 36,
    velocityReliability: 89,
    overtimeHoursPerWeek: 7,
    approvalLatencyDays: 3.4,
    stakeholderLatencyDays: 12,
    teamSize: 95,
    seniorJuniorRatio: 0.42,
    annualAttritionRate: 8,
    newHireRampRatio: 10,
    podModularity: 5,
    brooksOverheadIndex: 0.38,
    isDelayed: 0,
    actualDelayMonths: 0,
    completionStatus: 'On-Time',
  },
  {
    id: 'case-05',
    projectName: 'BioPulse: Automated Clinical Trial Registry',
    domain: 'Healthcare & Life Sciences',
    plannedDurationMonths: 16,
    budgetMillions: 9.5,
    requirementsVolatility: 35,
    dependencyCount: 9,
    techNoveltyRisk: 2,
    earlyMilestoneSlippage: 8,
    sprintVelocity: 38,
    velocityReliability: 82,
    overtimeHoursPerWeek: 6,
    approvalLatencyDays: 2.1,
    stakeholderLatencyDays: 14,
    teamSize: 24,
    seniorJuniorRatio: 0.35,
    annualAttritionRate: 11,
    newHireRampRatio: 18,
    podModularity: 4,
    brooksOverheadIndex: 0.19,
    isDelayed: 0,
    actualDelayMonths: 0,
    completionStatus: 'On-Time',
  },
  {
    id: 'case-06',
    projectName: 'MetroLink: Urban Rail CBTC Automation System',
    domain: 'Megaproject & Transit',
    plannedDurationMonths: 48,
    budgetMillions: 180.0,
    requirementsVolatility: 54,
    dependencyCount: 34,
    techNoveltyRisk: 4,
    earlyMilestoneSlippage: 28,
    sprintVelocity: 22,
    velocityReliability: 61,
    overtimeHoursPerWeek: 15,
    approvalLatencyDays: 7.8,
    stakeholderLatencyDays: 36,
    teamSize: 220,
    seniorJuniorRatio: 0.16,
    annualAttritionRate: 22,
    newHireRampRatio: 35,
    podModularity: 2,
    brooksOverheadIndex: 0.96,
    isDelayed: 1,
    actualDelayMonths: 15.4,
    completionStatus: 'Delayed',
  }
];

export function calculateBrooksIndex(teamSize: number, podModularity: number): number {
  // Brooks' Law communication lines = N*(N-1)/2
  // High pod modularity decouples communication channels into small clusters
  const rawChannels = (teamSize * (teamSize - 1)) / 2;
  const effectiveChannels = rawChannels / Math.max(1, podModularity * 1.8);
  // Normalize index from 0 to 1 with smooth asymptotic saturation
  return Math.min(1.0, Math.round((effectiveChannels / (effectiveChannels + 250)) * 100) / 100);
}

export function evaluateDataGeneratingProcess(p: Omit<ProjectData, 'isDelayed' | 'actualDelayMonths' | 'completionStatus' | 'brooksOverheadIndex'>): {
  isDelayed: 0 | 1;
  actualDelayMonths: number;
  brooksIndex: number;
  delayLogOdds: number;
} {
  const brooks = calculateBrooksIndex(p.teamSize, p.podModularity);

  // Calibrated logistic regression latent risk formula based on empirical software engineering research
  let logOdds = -2.1; // Base bias (corresponds to ~25% baseline delay in well-behaved projects)

  // 1. Scope and Management Friction
  logOdds += (p.requirementsVolatility - 25) * 0.045; // Scope creep
  logOdds += (p.dependencyCount - 8) * 0.075; // External handoffs
  logOdds += (p.techNoveltyRisk - 2.5) * 0.35; // Technology novelty
  logOdds += (p.earlyMilestoneSlippage - 5) * 0.055; // Leading schedule indicator

  // 2. Team Productivity & Burnout
  logOdds -= (p.velocityReliability - 75) * 0.06; // High reliability protects against delay
  logOdds -= (p.sprintVelocity - 30) * 0.02;

  // Non-linear overtime penalty: Moderate overtime (0-8h) is fine, but severe overtime (>12h) causes quality collapse & rework
  if (p.overtimeHoursPerWeek > 10) {
    const excessOvertime = p.overtimeHoursPerWeek - 10;
    logOdds += excessOvertime * 0.14;
  }

  logOdds += (p.approvalLatencyDays - 2.5) * 0.22; // Bottlenecks in review
  logOdds += (p.stakeholderLatencyDays - 10) * 0.05; // Bureaucratic wait time

  // 3. Team Size & Organizational Structure
  // Brooks' Law communication friction
  logOdds += brooks * 1.8;

  // Team Size direct effect if large
  if (p.teamSize > 50) {
    logOdds += Math.log10(p.teamSize / 40) * 1.1;
  }

  // Seniority ratio: Low senior ratio severely impedes delivery
  logOdds -= (p.seniorJuniorRatio - 0.3) * 3.4;

  // Attrition & onboarding ramp friction
  logOdds += (p.annualAttritionRate - 12) * 0.07;
  logOdds += (p.newHireRampRatio - 15) * 0.035;

  // Interaction terms: Large team + High turnover + Low senior ratio = catastrophic compounding
  if (p.teamSize > 60 && p.seniorJuniorRatio < 0.22 && p.annualAttritionRate > 18) {
    logOdds += 1.2;
  }

  // Convert logOdds to probability
  const probability = 1 / (1 + Math.exp(-logOdds));

  // Determine binary outcome
  const isDelayed: 0 | 1 = probability >= 0.5 ? 1 : 0;

  // Calculate actual delay magnitude in months
  let actualDelayMonths = 0;
  if (isDelayed === 1) {
    // Expected delay scales with planned duration and severity of logOdds
    const scaleFactor = Math.max(0.15, (probability - 0.4) * 0.7);
    actualDelayMonths = Math.round((p.plannedDurationMonths * scaleFactor + (probability * 3.5)) * 10) / 10;
  }

  return {
    isDelayed,
    actualDelayMonths,
    brooksIndex: brooks,
    delayLogOdds: logOdds,
  };
}

export function generateHistoricalDataset(count = 1200): ProjectData[] {
  const rng = new SeededRandom(1337);
  const dataset: ProjectData[] = [];

  // Add the hand-crafted preset benchmarks first
  for (const preset of PRESET_PROJECTS) {
    dataset.push({ ...preset });
  }

  const prefixNames = [
    'Aegis', 'Titan', 'Vanguard', 'Omni', 'Centaur', 'Nexus', 'Helios', 'Orion',
    'Atlas', 'Apex', 'Horizon', 'Meridian', 'Cobalt', 'Zenith', 'Sentinel', 'Spectra',
    'Polaris', 'Chronos', 'Genesis', 'Synergy', 'Catalyst', 'Aura', 'Solstice', 'Eclipse'
  ];

  const suffixTerms: Record<ProjectDomain, string[]> = {
    'Aerospace & Defense': ['Avionics Suite', 'Radar Defense Grid', 'Orbital Payload', 'Guidance Subsystem', 'Flight Telemetry', 'Tactical Comms'],
    'Enterprise ERP & Core': ['SAP S/4HANA Modernization', 'Global Supply Chain Engine', 'Billing Ledger Overhaul', 'Workforce ERP Consolidation', 'Procurement Hub'],
    'FinTech & Banking': ['Real-Time Settlement Gateway', 'Core Banking Ledger', 'AML Compliance Pipeline', 'Algorithmic Liquidity Engine', 'Fraud Interceptor'],
    'Healthcare & Life Sciences': ['EHR Interoperability Cloud', 'Genomic Sequencing Pipeline', 'Clinical Trial Analytics', 'Diagnostic Telemetry System', 'Medical Device Firmware'],
    'Cloud & Infrastructure': ['Multi-Region Kubernetes Mesh', 'Zero-Trust Identity Core', 'Observability Fabric', 'Disaster Recovery Vault', 'Distributed Edge Gateway'],
    'Megaproject & Transit': ['High-Speed Rail Signaling', 'Automated Port Logistics', 'Airport Baggage Transit Hub', 'Smart Grid Power SCADA', 'Subway Control Automation'],
  };

  const targetCount = count - PRESET_PROJECTS.length;

  for (let i = 0; i < targetCount; i++) {
    const domain = DOMAINS[Math.floor(rng.range(0, DOMAINS.length))];
    const prefix = prefixNames[Math.floor(rng.range(0, prefixNames.length))];
    const suffixList = suffixTerms[domain];
    const suffix = suffixList[Math.floor(rng.range(0, suffixList.length))];
    const projectName = `${prefix}: ${suffix} Phase ${Math.floor(rng.range(1, 4))}`;

    // Domain-adjusted characteristics
    let plannedDurationMonths = Math.round(rng.gaussian(domain === 'Megaproject & Transit' ? 36 : domain === 'Aerospace & Defense' ? 30 : 18, 8));
    plannedDurationMonths = Math.max(6, Math.min(60, plannedDurationMonths));

    let budgetMillions = Math.round(rng.gaussian(domain === 'Megaproject & Transit' ? 85 : domain === 'Aerospace & Defense' ? 50 : 18, 25) * 10) / 10;
    budgetMillions = Math.max(1.5, Math.min(250, budgetMillions));

    let teamSize = Math.round(rng.gaussian(domain === 'Megaproject & Transit' ? 140 : domain === 'Enterprise ERP & Core' ? 70 : 35, 30));
    teamSize = Math.max(6, Math.min(320, teamSize));

    let podModularity = Math.round(rng.range(1, 5));
    if (teamSize > 80 && rng.next() > 0.4) {
      podModularity = Math.min(podModularity, 3); // Large projects often suffer from lower modularity
    }

    let requirementsVolatility = Math.round(rng.gaussian(domain === 'FinTech & Banking' ? 42 : 28, 16));
    requirementsVolatility = Math.max(5, Math.min(95, requirementsVolatility));

    let dependencyCount = Math.round(rng.gaussian(domain === 'Megaproject & Transit' ? 24 : 10, 7));
    dependencyCount = Math.max(1, Math.min(38, dependencyCount));

    let techNoveltyRisk = Math.round(rng.range(1, 5));
    let earlyMilestoneSlippage = Math.round(rng.gaussian(8, 14));
    earlyMilestoneSlippage = Math.max(-15, Math.min(55, earlyMilestoneSlippage));

    // Productivity metrics
    let sprintVelocity = Math.round(rng.gaussian(34, 10));
    sprintVelocity = Math.max(12, Math.min(58, sprintVelocity));

    let velocityReliability = Math.round(rng.gaussian(76, 12));
    velocityReliability = Math.max(48, Math.min(98, velocityReliability));

    let overtimeHoursPerWeek = Math.round(rng.gaussian(7, 5));
    overtimeHoursPerWeek = Math.max(0, Math.min(26, overtimeHoursPerWeek));

    let approvalLatencyDays = Math.round(rng.gaussian(3.2, 1.8) * 10) / 10;
    approvalLatencyDays = Math.max(0.5, Math.min(9.5, approvalLatencyDays));

    let stakeholderLatencyDays = Math.round(rng.gaussian(14, 8));
    stakeholderLatencyDays = Math.max(2, Math.min(42, stakeholderLatencyDays));

    // Team structure
    let seniorJuniorRatio = Math.round(rng.gaussian(0.32, 0.12) * 100) / 100;
    seniorJuniorRatio = Math.max(0.08, Math.min(0.85, seniorJuniorRatio));

    let annualAttritionRate = Math.round(rng.gaussian(14, 7));
    annualAttritionRate = Math.max(3, Math.min(42, annualAttritionRate));

    let newHireRampRatio = Math.round(rng.gaussian(20, 11));
    newHireRampRatio = Math.max(0, Math.min(60, newHireRampRatio));

    const evalResult = evaluateDataGeneratingProcess({
      id: `proj-${i + 7}`,
      projectName,
      domain,
      plannedDurationMonths,
      budgetMillions,
      requirementsVolatility,
      dependencyCount,
      techNoveltyRisk,
      earlyMilestoneSlippage,
      sprintVelocity,
      velocityReliability,
      overtimeHoursPerWeek,
      approvalLatencyDays,
      stakeholderLatencyDays,
      teamSize,
      seniorJuniorRatio,
      annualAttritionRate,
      newHireRampRatio,
      podModularity,
    });

    dataset.push({
      id: `proj-${i + 7}`,
      projectName,
      domain,
      plannedDurationMonths,
      budgetMillions,
      requirementsVolatility,
      dependencyCount,
      techNoveltyRisk,
      earlyMilestoneSlippage,
      sprintVelocity,
      velocityReliability,
      overtimeHoursPerWeek,
      approvalLatencyDays,
      stakeholderLatencyDays,
      teamSize,
      seniorJuniorRatio,
      annualAttritionRate,
      newHireRampRatio,
      podModularity,
      brooksOverheadIndex: evalResult.brooksIndex,
      isDelayed: evalResult.isDelayed,
      actualDelayMonths: evalResult.actualDelayMonths,
      completionStatus: evalResult.isDelayed === 1 ? 'Delayed' : 'On-Time',
    });
  }

  return dataset;
}

export function exportDatasetToCSV(data: ProjectData[]): string {
  if (data.length === 0) return '';
  const headers = [
    'id', 'projectName', 'domain', 'plannedDurationMonths', 'budgetMillions',
    'requirementsVolatility', 'dependencyCount', 'techNoveltyRisk', 'earlyMilestoneSlippage',
    'sprintVelocity', 'velocityReliability', 'overtimeHoursPerWeek', 'approvalLatencyDays',
    'stakeholderLatencyDays', 'teamSize', 'seniorJuniorRatio', 'annualAttritionRate',
    'newHireRampRatio', 'podModularity', 'brooksOverheadIndex', 'isDelayed', 'actualDelayMonths', 'completionStatus'
  ];

  const rows = data.map(row => {
    return [
      `"${row.id}"`,
      `"${row.projectName.replace(/"/g, '""')}"`,
      `"${row.domain}"`,
      row.plannedDurationMonths,
      row.budgetMillions,
      row.requirementsVolatility,
      row.dependencyCount,
      row.techNoveltyRisk,
      row.earlyMilestoneSlippage,
      row.sprintVelocity,
      row.velocityReliability,
      row.overtimeHoursPerWeek,
      row.approvalLatencyDays,
      row.stakeholderLatencyDays,
      row.teamSize,
      row.seniorJuniorRatio,
      row.annualAttritionRate,
      row.newHireRampRatio,
      row.podModularity,
      row.brooksOverheadIndex,
      row.isDelayed,
      row.actualDelayMonths,
      `"${row.completionStatus}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
