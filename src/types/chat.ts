
// Type definitions for the chat interface

export type ScenarioMode = 'basic' | 'advanced';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any; // For tracking context and processing information
}

export interface ScenarioResponse {
  basic: string[];
  advanced: string[];
}

export interface RetirementParameters {
  currentAge?: number;
  targetRetirementAge?: number;
  targetAnnualIncome?: number;
  expectedLifespan?: number;
  inflationRate?: number;
  expectedReturnRate?: number;
}

export interface FinancialParameters {
  incomeSources?: any[];
  totalMonthlyIncome?: number;
  scenarioMode?: ScenarioMode;
  monthlySavingsRate?: number;
  monthlyExpenses?: number;
  netWorth?: number;
  assets?: any[];
  liabilities?: any[];
  taxRate?: number;
  retirementContributions?: {
    monthly?: number;
    currentBalance?: number;
  };
  mortgageParameters?: {
    maxDebtToIncomeRatio?: number;
    propertyTaxRate?: number;
    propertyInsuranceRate?: number;
    hoaFees?: number;
    newMortgageInterestRate?: number;
    mortgageTermYears?: number;
    otherMonthlyDebtObligations?: number;
    downPaymentMinimumPercentage?: number;
  };
  taxParameters?: {
    taxBrackets?: any[];
    availableDeductions?: any[];
    previousTaxPaid?: number;
    pillar3aContribution?: number;
    potentialCredits?: any[];
  };
  retirementParameters?: RetirementParameters;
}
