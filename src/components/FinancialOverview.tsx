
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  ChartPie
} from "lucide-react";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  calculateMonthlyCashFlow
} from '@/utils/calculations';
import { 
  incomeSources, 
  expenses, 
  assets, 
  liabilities 
} from '@/data/mockData';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';

const FinancialOverview: React.FC = () => {
  const totalIncome = calculateTotalIncome(incomeSources);
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  const netWorth = calculateNetWorth(assets, liabilities);
  const cashFlow = calculateMonthlyCashFlow(incomeSources, expenses);
  
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Data for expense breakdown chart
  const expenseData = expenses.map(expense => ({
    name: expense.category,
    value: expense.amount,
  }));
  
  // Chart colors
  const COLORS = ['#0B3954', '#087E8B', '#5AAA95', '#F9A826', '#FF5A5F', '#C81D25', '#6C757D', '#333333'];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-shadow card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Monthly Income</CardTitle>
              <DollarSign className="h-5 w-5 text-findt-primary" />
            </div>
            <CardDescription>Total from all sources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            <div className="flex items-center mt-2 text-sm text-findt-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+2.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Monthly Expenses</CardTitle>
              <CreditCard className="h-5 w-5 text-findt-primary" />
            </div>
            <CardDescription>Total spending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            <div className="flex items-center mt-2 text-sm text-findt-danger">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+1.8% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Net Worth</CardTitle>
              <ChartPie className="h-5 w-5 text-findt-primary" />
            </div>
            <CardDescription>Assets minus liabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(netWorth)}</p>
            <div className="flex items-center mt-2 text-sm text-findt-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+3.2% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Monthly Savings</CardTitle>
              <PiggyBank className="h-5 w-5 text-findt-primary" />
            </div>
            <CardDescription>Income minus expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(cashFlow)}</p>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Savings Rate</span>
                <span>{savingsRate.toFixed(1)}%</span>
              </div>
              <Progress value={savingsRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Monthly Expense Breakdown</CardTitle>
            <CardDescription>Where your money goes each month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(name) => `Category: ${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Net Worth Composition</CardTitle>
            <CardDescription>Assets vs Liabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Total Assets</span>
                  <span className="font-medium">{formatCurrency(totalAssets)}</span>
                </div>
                <Progress value={100} className="h-2 bg-findt-muted" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Total Liabilities</span>
                  <span className="font-medium">{formatCurrency(totalLiabilities)}</span>
                </div>
                <Progress value={(totalLiabilities / totalAssets) * 100} className="h-2 bg-findt-muted" />
              </div>
              
              <div className="pt-4">
                <h4 className="font-semibold mb-3">Asset Breakdown</h4>
                {assets.map((asset) => (
                  <div key={asset.id} className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{asset.name}</span>
                      <span>{formatCurrency(asset.value)}</span>
                    </div>
                    <Progress 
                      value={(asset.value / totalAssets) * 100} 
                      className="h-1.5 bg-findt-muted mt-1" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
