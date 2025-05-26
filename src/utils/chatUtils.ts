import { incomeSources } from '@/data/mockData';
import { calculateTotalIncome } from '@/utils/calculations';
import { ScenarioMode, ScenarioResponse } from '@/types/chat';

const scenarioQuestions: Record<string, ScenarioResponse> = {
  retirement: {
    basic: [
      "Based on your current savings rate of 16.8% and retirement contributions, you're on track to accumulate approximately CHF 1.2 million by age 65, which would provide an estimated monthly income of CHF 4,000.",
      "I recommend increasing your Pillar 3a contributions by CHF 200 monthly. This adjustment would significantly improve your retirement outlook while providing immediate tax benefits."
    ],
    advanced: [
      "Looking at your current portfolio allocation of 70% stocks and 30% bonds, I project you'll reach your retirement goal in approximately 25 years. However, if we adjust to a 75/25 allocation for the next 10 years before gradually shifting to 60/40, my models suggest you could accelerate this timeline by 3 years while maintaining similar risk levels.",
      "Your current retirement strategy has a 78% probability of meeting your stated goals. By implementing a two-phase approach—increasing contributions by 5% now and optimizing tax-advantaged accounts—we could raise this probability to 92% while reducing your effective tax rate by approximately 2.3% annually."
    ]
  },
  investment: {
    basic: [
      "Your current investment portfolio has returned 6.8% annually over the past 3 years, which is slightly above the market average.",
      "I've noticed your portfolio is heavily concentrated in the technology sector. Consider diversifying into other sectors like healthcare and consumer staples to reduce risk."
    ],
    advanced: [
      "After analyzing your investment portfolio against current market conditions, I see potential for optimization. Your tech allocation (48%) has served you well with 11.2% returns, but introduces sector concentration risk. By reallocating 15% to emerging markets and 10% to infrastructure, models suggest you could maintain similar returns while reducing volatility by approximately 12%.",
      "Your portfolio's Sharpe ratio of 0.72 indicates decent risk-adjusted returns, but falls short of optimal efficiency. By introducing a 15% allocation to alternative assets like REITs and reducing bond duration, my analysis indicates we could increase this ratio to 0.85 while maintaining your risk tolerance level."
    ]
  },
  mortgage: {
    basic: [
      "Based on your financial profile, you could qualify for a mortgage of up to CHF 750,000 with a 20% down payment. Your estimated monthly payment would be around CHF 2,400 with current interest rates.",
      "Your debt-to-income ratio looks healthy for a mortgage application. With your income of CHF 11,500 monthly, you could comfortably afford a mortgage of up to CHF 800,000 over 25 years."
    ],
    advanced: [
      "I've analyzed your financial situation in the context of current mortgage rates and property valuations in your target areas. With your income of CHF 11,500 monthly and existing debts, you could optimize your purchase by targeting a property around CHF 900,000 with a 25% down payment. This would result in a loan-to-value ratio of 75% and a monthly payment of CHF 2,680, keeping your housing expense ratio at 23.3% - well within the recommended 28% threshold.",
      "Based on simulations using your income stability, savings rate, and risk profile, I recommend a mixed-rate mortgage strategy: 70% fixed at current rates (1.2%) for 10 years and 30% variable. This approach provides a 85% probability of outperforming a straight fixed-rate mortgage over a 15-year period, with potential savings of CHF 37,500 over the life of the loan."
    ]
  },
  tax: {
    basic: [
      "Based on your current income and deductions, your estimated tax liability is CHF 31,500 for the year. You could reduce this by maximizing your Pillar 3a contributions.",
      "I've analyzed your tax situation and found potential deductions you're not taking advantage of. Specifically, you could deduct up to CHF 6,883 by contributing to a Pillar 3a account."
    ],
    advanced: [
      "After analyzing your tax returns from the past three years alongside current regulations, I've identified several optimization opportunities. By restructuring your charitable contributions into a donor-advised fund, claiming home office deductions more strategically, and fully utilizing pension contribution allowances, you could reduce your effective tax rate from 25.3% to approximately 22.1%, resulting in annual savings of CHF 9,200.",
      "Your current tax efficiency score is 67/100. By implementing a three-phase optimization strategy—first maximizing pension contributions, then restructuring investment income, and finally optimizing property-related deductions—you could increase this score to 85/100 while reducing audit risk factors by 40% according to my analysis of recent tax authority patterns."
    ]
  },
  budget: {
    basic: [
      "Your housing expenses currently account for 35% of your monthly income, which is slightly above the recommended 30%. Consider ways to reduce this expense if possible.",
      "I've analyzed your spending patterns and noticed your food expenses have increased by 15% over the last three months. Setting a grocery budget might help control these costs."
    ],
    advanced: [
      "My analysis of your spending patterns over the past 18 months reveals three key optimization opportunities. Your discretionary spending fluctuates significantly (±27%) month-to-month, creating cash flow inefficiencies. By implementing a smoothing strategy that pre-allocates entertainment and dining funds at 15% below current averages, you could increase your annual savings by approximately CHF 8,400 without significantly impacting lifestyle satisfaction metrics.",
      "Based on comparative analysis with households in similar income brackets, your current expense-to-value ratio is suboptimal in three categories: transportation (32% efficiency gap), utilities (18% gap), and subscription services (43% gap). Implementing the recommended consolidation strategy could release approximately CHF 14,300 in annual cash flow while maintaining equivalent utility values."
    ]
  },
  property: {
    basic: [
      "In the Geneva market, property prices have appreciated by an average of 3.2% annually over the past 5 years. This suggests good potential for capital appreciation.",
      "Based on the rent vs. buy analysis, buying would be financially advantageous if you plan to stay in the property for at least 7 years, considering closing costs and market appreciation."
    ],
    advanced: [
      "I've conducted a detailed analysis of your target property markets using the last decade of price movement data, regulatory changes, and infrastructure development plans. The Nyon area shows a projected 5-year appreciation potential of 16.8% compared to 12.3% in Lausanne, with significantly lower price volatility (standard deviation of 2.1% vs 3.8%). When factoring in your commute preferences and family needs, Nyon offers an optimized location profile with 22% better value-to-price ratio.",
      "My buy vs. rent analysis incorporates multiple scenarios including interest rate projections, tax implications, and opportunity cost of capital. In your specific situation, the break-even point occurs at 5.4 years of ownership when factoring in all variables. However, sensitivity analysis shows that if interest rates increase by more than 0.75% during the next 2 years, this timeline extends to 6.8 years. The optimal strategy according to my simulations involves purchasing with a 10-year fixed-rate mortgage component of 65% and variable-rate for the remainder."
    ]
  },
  savings: {
    basic: [
      "Your current savings rate is 16.8% of your income. Financial experts typically recommend saving 15-20% of your income, so you're on the right track.",
      "At your current savings rate, you're projected to reach your emergency fund goal of CHF 30,000 in approximately 8 months."
    ],
    advanced: [
      "After analyzing your income patterns, expense fluctuations, and financial goals, I've developed a dynamic savings optimization model. Your current approach achieves a saving efficiency rating of 73/100. By implementing a tiered allocation system—15% to high-yield emergency funds, 45% to tax-advantaged retirement vehicles, and 40% to goal-based investment buckets—you could increase this rating to 89/100 while accelerating your major financial goals by an average of 26 months.",
      "Your current saving-to-goal alignment shows mismatches in timing and allocation. For example, your education fund is overfunded by 18% based on projected needs, while your property down payment fund is underfunded by 24% against target timing. Rebalancing these allocations and implementing the suggested automated micro-saving strategy could improve your goal achievement probability from the current 76% to 94% while maintaining the same total contribution level."
    ]
  }
};

const parseAmount = (amountStr: string): number => {
  let cleanStr = amountStr.toLowerCase().replace(/[^\d,.kmb]/g, '');
  
  let multiplier = 1;
  if (cleanStr.includes('k')) {
    multiplier = 1000;
    cleanStr = cleanStr.replace('k', '');
  } else if (cleanStr.includes('m')) {
    multiplier = 1000000;
    cleanStr = cleanStr.replace('m', '');
  } else if (cleanStr.includes('b')) {
    multiplier = 1000000000;
    cleanStr = cleanStr.replace('b', '');
  }
  
  const baseNumber = parseFloat(cleanStr.replace(/,/g, ''));
  return isNaN(baseNumber) ? 0 : baseNumber * multiplier;
};

export const generateInsight = (userQuestion: string, scenarioMode: ScenarioMode = 'basic'): string => {
  const userQuestionLower = userQuestion.toLowerCase();
  
  const downPaymentRegex = /(?:minimum\s+)?down\s*payment.*?([\d,.]+[kmb]?\s*(?:chf|usd|dollars?|francs?)?)/i;
  const propertyRegex = /(?:worth|cost|price|value).*?([\d,.]+[kmb]?\s*(?:chf|usd|dollars?|francs?)?)/i;
  const affordabilityRegex = /(?:afford|qualify).*?(?:earn|salary|income).*?([\d.]+%?\s*(?:more|increase|higher))/i;
  const mortgageCalculationRegex = /(?:mortgage|loan|home\s+loan).*?(?:calculate|compute|determine)/i;
  
  let response = "";
  
  const propertyMatch = userQuestionLower.match(propertyRegex);
  const propertyValue = propertyMatch ? parseAmount(propertyMatch[1]) : 0;
  
  if (downPaymentRegex.test(userQuestionLower) && propertyValue > 0) {
    const minDownPayment = propertyValue * 0.2;
    response = `For a property worth ${formatCurrency(propertyValue)}, the minimum down payment required would be ${formatCurrency(minDownPayment)} (20% of the property value). This is based on standard mortgage requirements. With this down payment, your estimated monthly mortgage payment would be ${formatCurrency(calculateMortgagePayment(propertyValue - minDownPayment, 0.035, 30))} assuming a 3.5% interest rate over 30 years.`;
  }
  else if (affordabilityRegex.test(userQuestionLower)) {
    const percentageMatch = userQuestionLower.match(/(\d+(?:\.\d+)?)\s*%/);
    const percentageIncrease = percentageMatch ? parseFloat(percentageMatch[1]) / 100 : 0;
    
    const baseIncome = calculateTotalIncome(incomeSources);
    const increasedIncome = baseIncome * (1 + percentageIncrease);
    const maxMonthlyPayment = increasedIncome * 0.28;
    const maxMortgage = calculateMaxMortgage(maxMonthlyPayment, 0.035, 30);
    
    response = `With a ${percentageIncrease * 100}% increase in your monthly income (from ${formatCurrency(baseIncome)} to ${formatCurrency(increasedIncome)}), you could potentially afford a mortgage of up to ${formatCurrency(maxMortgage)}. This assumes spending no more than 28% of your gross monthly income on mortgage payments and a 3.5% interest rate over 30 years.`;
  }
  else if (mortgageCalculationRegex.test(userQuestionLower)) {
    response = "To calculate your maximum affordable mortgage, I'll need to consider your income, existing debts, property taxes, insurance, and desired mortgage terms. Based on typical Swiss mortgage standards, you'd need at least a 20% down payment and your total housing costs (mortgage, taxes, insurance) should not exceed 33% of your gross monthly income. I can provide a detailed calculation based on the specific property value and your financial profile.";
  }
  else {
    let category: string | null = null;
    let responsePool: string[] = [];
    
    if (userQuestionLower.includes('retire') || userQuestionLower.includes('pension') || userQuestionLower.includes('pillar 3')) {
      category = 'retirement';
    } else if (userQuestionLower.includes('invest') || userQuestionLower.includes('portfolio') || userQuestionLower.includes('stock')) {
      category = 'investment';
    } else if (userQuestionLower.includes('mortgage') || userQuestionLower.includes('house') || userQuestionLower.includes('loan')) {
      category = 'mortgage';
    } else if (userQuestionLower.includes('tax') || userQuestionLower.includes('deduction')) {
      category = 'tax';
    } else if (userQuestionLower.includes('budget') || userQuestionLower.includes('spend') || userQuestionLower.includes('expense')) {
      category = 'budget';
    } else if (userQuestionLower.includes('property') || userQuestionLower.includes('real estate') || userQuestionLower.includes('buy vs rent')) {
      category = 'property';
    } else if (userQuestionLower.includes('save') || userQuestionLower.includes('saving') || userQuestionLower.includes('emergency fund')) {
      category = 'savings';
    }
    
    if (category && scenarioQuestions[category]) {
      responsePool = scenarioQuestions[category][scenarioMode];
    }
    
    if (responsePool.length > 0) {
      return responsePool[Math.floor(Math.random() * responsePool.length)];
    }
    
    return "That's a great question. To give you the most accurate advice tailored to your financial situation, I'd need to analyze your complete financial profile. Based on the data I have, I can provide a general recommendation, but for more specific guidance, we should look at your particular circumstances in more detail. Would you like me to analyze a specific aspect of your finances?";
  }
  
  return response || "I apologize, but I need more specific information about the property value, your income, or other financial details to provide accurate mortgage calculations. Could you please provide more details?";
};

export const calculateMortgagePayment = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  return principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -numPayments)));
};

export const calculateMaxMortgage = (monthlyPayment: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  return monthlyPayment * ((Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
};

export const calculateMortgageAffordability = (
  monthlyIncome: number,
  propertyValue: number,
  downPayment: number,
  interestRate: number,
  mortgageTermYears: number,
  propertyTaxRate: number,
  insuranceRate: number,
  monthlyHOAFees: number,
  otherMonthlyDebt: number,
  maxDebtToIncomeRatio: number
): {
  isAffordable: boolean;
  maxLoanAmount: number;
  affordablePropertyValue: number;
  monthlyPayment: number;
  totalMonthlyHousingCost: number;
  debtToIncomeRatio: number;
} => {
  const maxMonthlyPayment = monthlyIncome * maxDebtToIncomeRatio - otherMonthlyDebt;
  
  const monthlyPropertyTax = (propertyValue * propertyTaxRate) / 12;
  const monthlyInsurance = (propertyValue * insuranceRate) / 12;
  
  const maxMortgagePayment = maxMonthlyPayment - monthlyPropertyTax - monthlyInsurance - monthlyHOAFees;
  
  const monthlyRate = interestRate / 12;
  const numPayments = mortgageTermYears * 12;
  const maxLoanAmount = maxMortgagePayment * ((Math.pow(1 + monthlyRate, numPayments) - 1) / 
                       (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
  
  const affordablePropertyValue = maxLoanAmount + downPayment;
  
  const requestedLoanAmount = propertyValue - downPayment;
  const monthlyPayment = calculateMortgagePayment(requestedLoanAmount, interestRate, mortgageTermYears);
  
  const totalMonthlyHousingCost = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyHOAFees;
  const debtToIncomeRatio = (totalMonthlyHousingCost + otherMonthlyDebt) / monthlyIncome;
  
  return {
    isAffordable: debtToIncomeRatio <= maxDebtToIncomeRatio,
    maxLoanAmount,
    affordablePropertyValue,
    monthlyPayment,
    totalMonthlyHousingCost,
    debtToIncomeRatio
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
