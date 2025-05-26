
// Mock financial data for demonstration purposes

// User profile
export const userProfile = {
  name: "Emma Schmidt",
  age: 35,
  occupation: "Software Engineer",
  location: "Geneva, Switzerland",
  taxRate: 0.25, // 25% effective tax rate
  maritalStatus: "Single",
  hasChildren: false,
};

// Account balances
export const accounts = [
  { id: 1, name: "UBS Checking", type: "checking", balance: 15000, currency: "CHF" },
  { id: 2, name: "Credit Suisse Savings", type: "savings", balance: 45000, currency: "CHF" },
  { id: 3, name: "PostFinance", type: "checking", balance: 8500, currency: "CHF" },
  { id: 4, name: "UBS Investment", type: "investment", balance: 78000, currency: "CHF" },
];

// Monthly income sources
export const incomeSources = [
  { id: 1, source: "Primary Salary", amount: 9000, frequency: "monthly", currency: "CHF" },
  { id: 2, source: "Freelance Work", amount: 2000, frequency: "monthly", currency: "CHF" },
  { id: 3, source: "Dividend Income", amount: 500, frequency: "monthly", currency: "CHF" },
];

// Monthly expenses
export const expenses = [
  { id: 1, category: "Housing", amount: 2500, frequency: "monthly", currency: "CHF" },
  { id: 2, category: "Food", amount: 800, frequency: "monthly", currency: "CHF" },
  { id: 3, category: "Transportation", amount: 400, frequency: "monthly", currency: "CHF" },
  { id: 4, category: "Utilities", amount: 300, frequency: "monthly", currency: "CHF" },
  { id: 5, category: "Entertainment", amount: 600, frequency: "monthly", currency: "CHF" },
  { id: 6, category: "Insurance", amount: 500, frequency: "monthly", currency: "CHF" },
  { id: 7, category: "Savings", amount: 1500, frequency: "monthly", currency: "CHF" },
  { id: 8, category: "Other", amount: 900, frequency: "monthly", currency: "CHF" },
];

// Assets
export const assets = [
  { id: 1, name: "Retirement Fund (Pillar 2)", value: 150000, type: "retirement", currency: "CHF" },
  { id: 2, name: "Private Pension (Pillar 3a)", value: 50000, type: "retirement", currency: "CHF" },
  { id: 3, name: "Stocks Portfolio", value: 78000, type: "investment", currency: "CHF" },
  { id: 4, name: "Cash Savings", value: 60000, type: "savings", currency: "CHF" },
];

// Liabilities
export const liabilities = [
  { id: 1, name: "Student Loan", amount: 15000, interestRate: 0.025, type: "loan", currency: "CHF" },
  { id: 2, name: "Car Loan", amount: 12000, interestRate: 0.039, type: "loan", currency: "CHF" },
  { id: 3, name: "Credit Card", amount: 2500, interestRate: 0.099, type: "credit", currency: "CHF" },
];

// Previous year tax information
export const taxHistory = [
  { year: 2022, income: 126000, taxPaid: 31500, deductions: 18000, currency: "CHF" },
  { year: 2021, income: 120000, taxPaid: 30000, deductions: 17000, currency: "CHF" },
  { year: 2020, income: 110000, taxPaid: 27500, deductions: 16000, currency: "CHF" },
];

// Real estate data (for rent vs. buy calculation)
export const realEstateOptions = {
  rentOptions: {
    currentMonthlyRent: 2500,
    annualRentIncrease: 0.02, // 2%
    rentalInsurance: 300, // annual
  },
  buyOptions: {
    propertyValue: 800000,
    downPaymentPercentage: 0.2, // 20%
    mortgageRate: 0.015, // 1.5%
    mortgageTermYears: 25,
    propertyTaxRate: 0.01, // 1%
    homeInsurance: 1200, // annual
    maintenanceCosts: 0.01, // 1% of property value annually
    estimatedAppreciationRate: 0.03, // 3% annually
  },
};

// Budget categories with recommended percentages
export const budgetRecommendations = {
  housing: { recommended: 0.3, current: 0.35 }, // 30% recommended, 35% current
  food: { recommended: 0.15, current: 0.11 }, // 15% recommended, 11% current
  transportation: { recommended: 0.10, current: 0.06 }, // 10% recommended, 6% current
  utilities: { recommended: 0.05, current: 0.04 }, // 5% recommended, 4% current
  entertainment: { recommended: 0.05, current: 0.08 }, // 5% recommended, 8% current
  insurance: { recommended: 0.10, current: 0.07 }, // 10% recommended, 7% current
  savings: { recommended: 0.15, current: 0.20 }, // 15% recommended, 20% current
  other: { recommended: 0.10, current: 0.12 }, // 10% recommended, 12% current
};

// AI suggestions based on financial data
export const aiSuggestions = [
  {
    id: 1,
    category: "Tax",
    title: "Maximize Pillar 3a Contributions",
    description: "Contributing the maximum annual amount to your Pillar 3a can reduce your taxable income by up to 6,883 CHF.",
    potentialSavings: 1720,
    difficulty: "Easy",
  },
  {
    id: 2,
    category: "Savings",
    title: "Refinance Your Car Loan",
    description: "Current rates are lower than your existing 3.9% car loan. Refinancing could save you approximately 240 CHF annually.",
    potentialSavings: 240,
    difficulty: "Medium",
  },
  {
    id: 3,
    category: "Tax",
    title: "Deduct Home Office Expenses",
    description: "As a part-time freelancer, you may be eligible to deduct home office expenses, potentially saving 600 CHF in taxes.",
    potentialSavings: 600,
    difficulty: "Medium",
  },
  {
    id: 4,
    category: "Investment",
    title: "Rebalance Your Stock Portfolio",
    description: "Your current allocation is heavily weighted in tech stocks. Rebalancing can reduce risk and potentially improve returns.",
    potentialSavings: "Variable",
    difficulty: "Medium",
  },
  {
    id: 5,
    category: "Budget",
    title: "Reduce Entertainment Spending",
    description: "Your entertainment spending is 3% above recommended levels. Reducing it could increase your savings by 220 CHF monthly.",
    potentialSavings: 2640,
    difficulty: "Hard",
  },
];

// Monthly historical spending by category (last 6 months)
export const spendingHistory = [
  {
    month: "November",
    housing: 2500,
    food: 780,
    transportation: 390,
    utilities: 310,
    entertainment: 630,
    insurance: 500,
    savings: 1500,
    other: 840,
  },
  {
    month: "October",
    housing: 2500,
    food: 820,
    transportation: 410,
    utilities: 290,
    entertainment: 580,
    insurance: 500,
    savings: 1500,
    other: 900,
  },
  {
    month: "September",
    housing: 2500,
    food: 790,
    transportation: 380,
    utilities: 310,
    entertainment: 610,
    insurance: 500,
    savings: 1500,
    other: 880,
  },
  {
    month: "August",
    housing: 2500,
    food: 810,
    transportation: 420,
    utilities: 320,
    entertainment: 590,
    insurance: 500,
    savings: 1500,
    other: 860,
  },
  {
    month: "July",
    housing: 2500,
    food: 830,
    transportation: 430,
    utilities: 300,
    entertainment: 620,
    insurance: 500,
    savings: 1500,
    other: 830,
  },
  {
    month: "June",
    housing: 2500,
    food: 800,
    transportation: 400,
    utilities: 290,
    entertainment: 640,
    insurance: 500,
    savings: 1500,
    other: 870,
  },
];

// Tax brackets for Geneva, Switzerland (simplified)
export const taxBrackets = [
  { min: 0, max: 30000, rate: 0.08 },
  { min: 30001, max: 50000, rate: 0.1 },
  { min: 50001, max: 75000, rate: 0.12 },
  { min: 75001, max: 100000, rate: 0.15 },
  { min: 100001, max: 150000, rate: 0.18 },
  { min: 150001, max: 200000, rate: 0.22 },
  { min: 200001, max: Infinity, rate: 0.25 },
];
