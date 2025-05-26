
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { calculateBudgetVariance, calculateTotalIncome } from '@/utils/calculations';
import { budgetRecommendations, incomeSources, expenses, spendingHistory } from '@/data/mockData';
import { toast } from '@/components/ui/sonner';

const BudgetOptimizer: React.FC = () => {
  const totalMonthlyIncome = calculateTotalIncome(incomeSources);
  
  // Initialize budget allocations from mock data
  const [budgetAllocations, setBudgetAllocations] = useState({
    housing: budgetRecommendations.housing.current,
    food: budgetRecommendations.food.current,
    transportation: budgetRecommendations.transportation.current,
    utilities: budgetRecommendations.utilities.current,
    entertainment: budgetRecommendations.entertainment.current,
    insurance: budgetRecommendations.insurance.current,
    savings: budgetRecommendations.savings.current,
    other: budgetRecommendations.other.current,
  });
  
  // Calculate budget variance
  const budgetAnalysis = calculateBudgetVariance(
    Object.entries(budgetRecommendations).reduce((acc, [key, value]) => {
      acc[key] = {
        recommended: value.recommended,
        current: budgetAllocations[key as keyof typeof budgetAllocations],
      };
      return acc;
    }, {} as Record<string, { recommended: number; current: number }>),
    totalMonthlyIncome
  );
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Handle budget allocation changes
  const handleAllocationChange = (category: string, value: number) => {
    setBudgetAllocations({
      ...budgetAllocations,
      [category]: value,
    });
  };
  
  // Generate data for budget comparison chart
  const generateBudgetComparisonData = () => {
    return Object.entries(budgetAnalysis).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      recommended: data.recommendedAmount,
      current: data.currentAmount,
      difference: data.difference,
    }));
  };
  
  // Generate data for spending history chart
  const transformSpendingHistory = () => {
    return spendingHistory.map((month) => ({
      month: month.month,
      Housing: month.housing,
      Food: month.food,
      Transportation: month.transportation,
      Utilities: month.utilities,
      Entertainment: month.entertainment,
      Insurance: month.insurance,
      Savings: month.savings,
      Other: month.other,
    })).reverse(); // Display most recent month last
  };
  
  const budgetComparisonData = generateBudgetComparisonData();
  const spendingHistoryData = transformSpendingHistory();
  
  // Calculate total of current budget allocations
  const totalAllocation = Object.values(budgetAllocations).reduce((sum, value) => sum + value, 0);
  
  // Check if the allocations add up to 100%
  const isValidAllocation = Math.abs(totalAllocation - 1) < 0.01; // Allow for small rounding errors
  
  // Apply the budget to the financial model
  const applyBudget = () => {
    if (!isValidAllocation) {
      toast.error("Budget allocation must add up to 100%");
      return;
    }
    
    toast.success("Budget updated successfully", {
      description: "Your new budget allocations have been applied.",
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Budget Optimization</h2>
      
      <Tabs defaultValue="allocations" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="allocations">Budget Allocations</TabsTrigger>
          <TabsTrigger value="history">Spending History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="allocations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>
                  Adjust your budget allocations. Total: {formatPercentage(totalAllocation)}
                  {!isValidAllocation && (
                    <span className="text-findt-danger ml-2">
                      (Must equal 100%)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(budgetAllocations).map(([category, value]) => {
                  const analysis = budgetAnalysis[category];
                  const recommendedValue = budgetRecommendations[category as keyof typeof budgetRecommendations].recommended;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={category} className="capitalize">
                          {category}
                        </Label>
                        <div className="flex gap-2">
                          <span className={analysis.status === 'good' ? 'text-findt-success' : 
                                           analysis.status === 'warning' ? 'text-findt-warning' : 
                                           'text-findt-danger'}>
                            {formatPercentage(value)}
                          </span>
                          <span className="text-muted-foreground">
                            (Rec: {formatPercentage(recommendedValue)})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Slider
                          id={category}
                          min={0}
                          max={1}
                          step={0.01}
                          value={[value]}
                          onValueChange={(values) => handleAllocationChange(category, values[0])}
                          className="flex-1"
                        />
                        <div className="w-20 text-right">
                          {formatCurrency(value * totalMonthlyIncome)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <Button 
                  onClick={applyBudget} 
                  className="w-full bg-findt-primary"
                  disabled={!isValidAllocation}
                >
                  Apply Budget
                </Button>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Budget Comparison</CardTitle>
                <CardDescription>Your allocations vs. recommendations</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetComparisonData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => formatCurrency(value)} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="recommended" name="Recommended" fill="#087E8B" />
                    <Bar dataKey="current" name="Your Budget" fill="#FF5A5F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6 card-shadow">
            <CardHeader>
              <CardTitle>Budget Analysis</CardTitle>
              <CardDescription>
                Total Monthly Income: {formatCurrency(totalMonthlyIncome)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(budgetAnalysis).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <span className={data.status === 'good' ? 'text-findt-success' : 
                                     data.status === 'warning' ? 'text-findt-warning' : 
                                     'text-findt-danger'}>
                        {data.difference > 0 ? '+' : ''}{formatCurrency(data.difference)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Recommended: {formatCurrency(data.recommendedAmount)}</span>
                      <span>Current: {formatCurrency(data.currentAmount)}</span>
                    </div>
                    
                    <div className="relative h-2">
                      <div className="absolute inset-0 bg-muted rounded-full"></div>
                      <div 
                        className={`absolute h-full rounded-full ${
                          data.status === 'good' ? 'bg-findt-success' : 
                          data.status === 'warning' ? 'bg-findt-warning' : 
                          'bg-findt-danger'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (data.currentAmount / data.recommendedAmount) * 100)}%`,
                          left: data.currentAmount < data.recommendedAmount ? '0' : undefined,
                          right: data.currentAmount >= data.recommendedAmount ? '0' : undefined,
                        }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {data.status === 'good' 
                        ? 'This allocation is within the recommended range.'
                        : data.status === 'warning'
                          ? 'This allocation is slightly outside the recommended range.'
                          : 'This allocation significantly deviates from recommendations.'
                      }
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Monthly Spending History</CardTitle>
              <CardDescription>Last 6 months of spending by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spendingHistoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Housing" stackId="a" fill="#0B3954" />
                  <Bar dataKey="Food" stackId="a" fill="#087E8B" />
                  <Bar dataKey="Transportation" stackId="a" fill="#5AAA95" />
                  <Bar dataKey="Utilities" stackId="a" fill="#F9A826" />
                  <Bar dataKey="Entertainment" stackId="a" fill="#FF5A5F" />
                  <Bar dataKey="Insurance" stackId="a" fill="#C81D25" />
                  <Bar dataKey="Savings" stackId="a" fill="#6C757D" />
                  <Bar dataKey="Other" stackId="a" fill="#333333" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {Object.entries({
              "Housing": "#0B3954",
              "Food": "#087E8B",
              "Transportation": "#5AAA95",
              "Entertainment": "#FF5A5F"
            }).map(([category, color]) => {
              // Calculate average spending for this category
              const categoryKey = category.toLowerCase();
              const categorySpendingValues = spendingHistory.map(month => 
                Number(month[categoryKey as keyof typeof month])
              );
              
              // Calculate the average using numeric values
              const categoryAverage = categorySpendingValues.reduce(
                (sum, amount) => sum + amount, 0
              ) / spendingHistory.length;
              
              // Calculate trend (is spending increasing or decreasing?)
              const oldestValue = Number(spendingHistory[spendingHistory.length - 1][categoryKey as keyof typeof spendingHistory[0]]);
              const newestValue = Number(spendingHistory[0][categoryKey as keyof typeof spendingHistory[0]]);
              const trend = newestValue - oldestValue;
              
              return (
                <Card key={category} className="card-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>Average monthly spending</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(categoryAverage)}</p>
                    <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-findt-danger' : 'text-findt-success'}`}>
                      <span>{trend > 0 ? '↑' : '↓'} {formatCurrency(Math.abs(trend))}</span>
                      <span className="ml-1">in 6 months</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${(categoryAverage / totalMonthlyIncome) * 100}%`, backgroundColor: color }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((categoryAverage / totalMonthlyIncome) * 100).toFixed(1)}% of income
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetOptimizer;
