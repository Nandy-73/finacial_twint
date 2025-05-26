
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { calculateEstimatedTax } from '@/utils/calculations';
import { taxBrackets, taxHistory, incomeSources } from '@/data/mockData';
import { toast } from '@/components/ui/sonner';

const TaxCalculator: React.FC = () => {
  const annualIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0) * 12;
  
  const [income, setIncome] = useState(annualIncome);
  const [deductions, setDeductions] = useState(18000);
  const [taxableIncome, setTaxableIncome] = useState(income - deductions);
  
  // Pre-calculated tax values for the chart
  const taxRatePoints = [
    { income: 25000, taxRate: calculateEstimatedTax(25000, taxBrackets) / 25000 * 100 },
    { income: 50000, taxRate: calculateEstimatedTax(50000, taxBrackets) / 50000 * 100 },
    { income: 75000, taxRate: calculateEstimatedTax(75000, taxBrackets) / 75000 * 100 },
    { income: 100000, taxRate: calculateEstimatedTax(100000, taxBrackets) / 100000 * 100 },
    { income: 125000, taxRate: calculateEstimatedTax(125000, taxBrackets) / 125000 * 100 },
    { income: 150000, taxRate: calculateEstimatedTax(150000, taxBrackets) / 150000 * 100 },
    { income: 200000, taxRate: calculateEstimatedTax(200000, taxBrackets) / 200000 * 100 },
    { income: 250000, taxRate: calculateEstimatedTax(250000, taxBrackets) / 250000 * 100 },
  ];
  
  // Find the closest income point for highlighting in the chart
  const closestIncomePoint = taxRatePoints.reduce((prev, curr) => 
    Math.abs(curr.income - income) < Math.abs(prev.income - income) ? curr : prev
  );
  
  const estimatedTax = calculateEstimatedTax(taxableIncome, taxBrackets);
  const effectiveTaxRate = (estimatedTax / taxableIncome * 100).toFixed(1);
  
  const suggestedDeductions = [
    { 
      id: 1, 
      name: "Pillar 3a Contribution", 
      amount: 6883, 
      description: "Maximum annual tax-deductible contribution to private pension" 
    },
    { 
      id: 2, 
      name: "Professional Expenses", 
      amount: 3000, 
      description: "Deduction for work-related expenses (transportation, meals, etc.)" 
    },
    { 
      id: 3, 
      name: "Health Insurance Premiums", 
      amount: 2500, 
      description: "Premiums paid for basic health insurance" 
    },
    { 
      id: 4, 
      name: "Charitable Donations", 
      amount: 2000, 
      description: "Donations to certified charitable organizations" 
    },
    { 
      id: 5, 
      name: "Home Office Deduction", 
      amount: 1800, 
      description: "For self-employed or freelance work conducted from home" 
    },
  ];
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  const handleCalculate = () => {
    setTaxableIncome(income - deductions);
    toast.success("Tax calculation updated", {
      description: `Estimated tax: ${formatCurrency(calculateEstimatedTax(income - deductions, taxBrackets))}`,
    });
  };
  
  const applyDeduction = (amount: number) => {
    setDeductions(prev => prev + amount);
    toast.info("Deduction applied", { 
      description: `Added ${formatCurrency(amount)} to your total deductions`
    });
    setTimeout(() => {
      setTaxableIncome(income - (deductions + amount));
    }, 100);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tax Optimization</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 card-shadow">
          <CardHeader>
            <CardTitle>Tax Calculator</CardTitle>
            <CardDescription>Estimate your tax liability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="annual-income">Annual Income (CHF)</Label>
              <Input
                id="annual-income"
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deductions">Total Deductions (CHF)</Label>
              <Input
                id="deductions"
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
              />
            </div>
            
            <Button onClick={handleCalculate} className="w-full bg-findt-primary">
              Calculate Tax
            </Button>
            
            <Separator className="my-4" />
            
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Taxable Income</p>
                  <p className="text-xl font-semibold">{formatCurrency(taxableIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Tax</p>
                  <p className="text-xl font-semibold">{formatCurrency(estimatedTax)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                <p className="text-xl font-semibold">{effectiveTaxRate}%</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Monthly Tax Payment</p>
                <p className="text-xl font-semibold">{formatCurrency(estimatedTax / 12)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle>Tax Rate Analysis</CardTitle>
            <CardDescription>
              Effective tax rate by income level in Geneva, Switzerland
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxRatePoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="income" 
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}%`} 
                  domain={[0, Math.ceil(Math.max(...taxRatePoints.map(p => p.taxRate)))]}
                />
                <Tooltip 
                  formatter={(value) => `${Number(value).toFixed(1)}%`}
                  labelFormatter={(value) => `Income: ${formatCurrency(Number(value))}`}
                />
                <Legend />
                <Bar dataKey="taxRate" name="Effective Tax Rate" fill="#087E8B">
                  {taxRatePoints.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.income === closestIncomePoint.income ? '#FF5A5F' : '#087E8B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 card-shadow">
          <CardHeader>
            <CardTitle>Suggested Tax Deductions</CardTitle>
            <CardDescription>
              Potential deductions you may be eligible for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedDeductions.map((deduction) => (
              <div key={deduction.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                <div>
                  <h4 className="font-medium">{deduction.name}</h4>
                  <p className="text-sm text-muted-foreground">{deduction.description}</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="font-semibold">{formatCurrency(deduction.amount)}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => applyDeduction(deduction.amount)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader>
            <CardTitle>Tax History</CardTitle>
            <CardDescription>Your tax data from previous years</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {taxHistory.map((year) => (
              <div key={year.year} className="space-y-2 border-b pb-3 last:border-b-0">
                <div className="flex justify-between">
                  <h4 className="font-semibold">{year.year}</h4>
                  <span className="text-muted-foreground">
                    Rate: {(year.taxPaid / year.income * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Income</p>
                    <p>{formatCurrency(year.income)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deductions</p>
                    <p>{formatCurrency(year.deductions)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tax Paid</p>
                    <p>{formatCurrency(year.taxPaid)}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaxCalculator;
