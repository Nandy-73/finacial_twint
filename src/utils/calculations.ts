
// Utility functions for financial calculations

// Calculate total income from all sources
export const calculateTotalIncome = (incomeSources: any[]): number => {
  return incomeSources.reduce((total, source) => total + source.amount, 0);
};

// Calculate total monthly expenses
export const calculateTotalExpenses = (expenses: any[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Calculate total asset value
export const calculateTotalAssets = (assets: any[]): number => {
  return assets.reduce((total, asset) => total + asset.value, 0);
};

// Calculate total liabilities
export const calculateTotalLiabilities = (liabilities: any[]): number => {
  return liabilities.reduce((total, liability) => total + liability.amount, 0);
};

// Calculate net worth
export const calculateNetWorth = (assets: any[], liabilities: any[]): number => {
  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  return totalAssets - totalLiabilities;
};

// Calculate monthly cash flow
export const calculateMonthlyCashFlow = (
  incomeSources: any[],
  expenses: any[]
): number => {
  const totalIncome = calculateTotalIncome(incomeSources);
  const totalExpenses = calculateTotalExpenses(expenses);
  return totalIncome - totalExpenses;
};

// Calculate estimated annual tax based on income and brackets
export const calculateEstimatedTax = (
  annualIncome: number,
  taxBrackets: { min: number; max: number; rate: number }[]
): number => {
  let tax = 0;
  
  for (const bracket of taxBrackets) {
    if (annualIncome > bracket.min) {
      const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
    
    if (annualIncome <= bracket.max) break;
  }
  
  return tax;
};

// Calculate monthly mortgage payment
export const calculateMortgagePayment = (
  principal: number,
  annualRate: number,
  termYears: number
): number => {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
};

// Calculate total cost of buying vs renting over a period
export const calculateBuyVsRent = (
  yearsPeriod: number,
  rentOptions: {
    currentMonthlyRent: number;
    annualRentIncrease: number;
    rentalInsurance: number;
  },
  buyOptions: {
    propertyValue: number;
    downPaymentPercentage: number;
    mortgageRate: number;
    mortgageTermYears: number;
    propertyTaxRate: number;
    homeInsurance: number;
    maintenanceCosts: number;
    estimatedAppreciationRate: number;
  }
): { 
  rentTotalCost: number;
  buyTotalCost: number;
  buyNetCost: number;
  buySavings: number;
  propertyValueAtEnd: number;
  equityBuilt: number;
  mortgageRemaining: number;
} => {
  // Rent calculation
  let rentTotalCost = 0;
  let currentRent = rentOptions.currentMonthlyRent;
  
  for (let year = 0; year < yearsPeriod; year++) {
    // Calculate year's rent with annual increases
    if (year > 0) {
      currentRent *= (1 + rentOptions.annualRentIncrease);
    }
    
    rentTotalCost += (currentRent * 12) + rentOptions.rentalInsurance;
  }
  
  // Buy calculation
  const downPayment = buyOptions.propertyValue * buyOptions.downPaymentPercentage;
  const loanAmount = buyOptions.propertyValue - downPayment;
  const monthlyMortgagePayment = calculateMortgagePayment(
    loanAmount,
    buyOptions.mortgageRate,
    buyOptions.mortgageTermYears
  );
  
  // Calculate property appreciation
  const propertyValueAtEnd = buyOptions.propertyValue * 
    Math.pow(1 + buyOptions.estimatedAppreciationRate, yearsPeriod);
  
  // Calculate remaining mortgage balance after the period
  const monthlyRate = buyOptions.mortgageRate / 12;
  const totalPayments = buyOptions.mortgageTermYears * 12;
  const paymentsMade = Math.min(yearsPeriod * 12, totalPayments);
  
  let mortgageRemaining = 0;
  if (paymentsMade < totalPayments) {
    mortgageRemaining = loanAmount * 
      (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }
  
  // Calculate total buying costs
  let buyTotalCost = downPayment;
  
  for (let year = 0; year < yearsPeriod; year++) {
    const yearlyPropertyTax = buyOptions.propertyValue * 
      Math.pow(1 + buyOptions.estimatedAppreciationRate, year) * 
      buyOptions.propertyTaxRate;
    
    const yearlyMaintenance = buyOptions.propertyValue * 
      Math.pow(1 + buyOptions.estimatedAppreciationRate, year) * 
      buyOptions.maintenanceCosts;
    
    buyTotalCost += (monthlyMortgagePayment * 12) + 
      yearlyPropertyTax + 
      buyOptions.homeInsurance + 
      yearlyMaintenance;
  }
  
  const equityBuilt = propertyValueAtEnd - mortgageRemaining;
  const buyNetCost = buyTotalCost - (equityBuilt - downPayment);
  const buySavings = rentTotalCost - buyNetCost;
  
  return {
    rentTotalCost,
    buyTotalCost,
    buyNetCost,
    buySavings,
    propertyValueAtEnd,
    equityBuilt,
    mortgageRemaining
  };
};

// Simulate future value with compound growth
export const calculateFutureValue = (
  principal: number,
  annualRate: number,
  years: number,
  monthlyContribution: number = 0
): number => {
  const monthlyRate = annualRate / 12;
  const numMonths = years * 12;
  
  // Future value of initial principal
  let futureValue = principal * Math.pow(1 + monthlyRate, numMonths);
  
  // Future value of monthly contributions (if any)
  if (monthlyContribution > 0) {
    futureValue += monthlyContribution * 
      ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate) * 
      (1 + monthlyRate);
  }
  
  return futureValue;
};

// Calculate budget variance from recommended percentages
export const calculateBudgetVariance = (
  actualBudget: Record<string, { recommended: number; current: number }>,
  totalIncome: number
): Record<string, { 
  recommended: number; 
  current: number;
  recommendedAmount: number;
  currentAmount: number;
  difference: number;
  status: 'good' | 'warning' | 'danger';
}> => {
  const result: Record<string, any> = {};
  
  for (const [category, data] of Object.entries(actualBudget)) {
    const recommendedAmount = totalIncome * data.recommended;
    const currentAmount = totalIncome * data.current;
    const difference = currentAmount - recommendedAmount;
    
    let status: 'good' | 'warning' | 'danger';
    
    // Determine status based on category and variance
    if (category === 'savings') {
      // For savings, higher than recommended is good
      status = difference >= 0 ? 'good' : 
        (difference > -500 ? 'warning' : 'danger');
    } else {
      // For expenses, lower than recommended is good
      status = difference <= 0 ? 'good' : 
        (difference < 500 ? 'warning' : 'danger');
    }
    
    result[category] = {
      ...data,
      recommendedAmount,
      currentAmount,
      difference,
      status
    };
  }
  
  return result;
};
