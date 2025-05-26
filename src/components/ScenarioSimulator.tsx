
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { calculateEstimatedTax, calculateFutureValue } from '@/utils/calculations';
import { incomeSources, taxBrackets, assets } from '@/data/mockData';
import { toast } from '@/components/ui/sonner';

const ScenarioSimulator: React.FC = () => {
  const baseIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);
  const annualBaseIncome = baseIncome * 12;
  
  const [salaryAdjustment, setSalaryAdjustment] = useState(0); // Percentage
  const [investmentAmount, setInvestmentAmount] = useState(10000); // CHF
  const [investmentReturn, setInvestmentReturn] = useState(5); // Percentage
  const [simulationYears, setSimulationYears] = useState(10);
  const [monthlySaving, setMonthlySaving] = useState(1500);
  
  // Calculate adjusted income based on salary adjustment
  const adjustedMonthlyIncome = baseIncome * (1 + salaryAdjustment / 100);
  const adjustedAnnualIncome = adjustedMonthlyIncome * 12;
  
  // Calculate current and projected tax
  const currentTax = calculateEstimatedTax(annualBaseIncome, taxBrackets);
  const projectedTax = calculateEstimatedTax(adjustedAnnualIncome, taxBrackets);
  
  // Calculate investment growth
  const currentInvestmentTotal = assets
    .filter(asset => asset.type === "investment")
    .reduce((sum, asset) => sum + asset.value, 0);
  
  const projectedInvestmentValue = calculateFutureValue(
    currentInvestmentTotal + investmentAmount,
    investmentReturn / 100,
    simulationYears,
    monthlySaving
  );
  
  // Generate projection data for charts
  const generateProjectionData = () => {
    const data = [];
    let currentValue = currentInvestmentTotal + investmentAmount;
    
    for (let year = 0; year <= simulationYears; year++) {
      const valueWithContributions = calculateFutureValue(
        currentInvestmentTotal + investmentAmount,
        investmentReturn / 100,
        year,
        monthlySaving
      );
      
      const valueWithoutContributions = calculateFutureValue(
        currentInvestmentTotal + investmentAmount,
        investmentReturn / 100,
        year
      );
      
      data.push({
        year: `Year ${year}`,
        withContributions: Math.round(valueWithContributions),
        withoutContributions: Math.round(valueWithoutContributions),
      });
    }
    
    return data;
  };
  
  // Generate income projection data
  const generateIncomeProjectionData = () => {
    const data = [];
    let currentSalary = baseIncome;
    let adjustedSalary = adjustedMonthlyIncome;
    
    for (let year = 0; year <= simulationYears; year++) {
      // Assume 2% annual growth for baseline
      const projectedBaseSalary = baseIncome * Math.pow(1.02, year);
      
      // Apply adjustment percentage on top of natural growth
      const projectedAdjustedSalary = projectedBaseSalary * (1 + salaryAdjustment / 100);
      
      data.push({
        year: `Year ${year}`,
        baseSalary: Math.round(projectedBaseSalary * 12), // Annual
        adjustedSalary: Math.round(projectedAdjustedSalary * 12), // Annual
      });
    }
    
    return data;
  };
  
  const projectionData = generateProjectionData();
  const incomeProjectionData = generateIncomeProjectionData();
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleRunSimulation = () => {
    toast.success("Simulation updated with new parameters", {
      description: `Projected value after ${simulationYears} years: ${formatCurrency(projectedInvestmentValue)}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Scenario Simulator</h2>
      
      <Tabs defaultValue="investment" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="investment">Investment Growth</TabsTrigger>
          <TabsTrigger value="income">Income Projection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="investment">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 card-shadow">
              <CardHeader>
                <CardTitle>Investment Parameters</CardTitle>
                <CardDescription>Adjust your investment scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="initial-investment">Initial Investment</Label>
                    <span>{formatCurrency(investmentAmount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="initial-investment"
                      min={0}
                      max={100000}
                      step={1000}
                      value={[investmentAmount]}
                      onValueChange={(values) => setInvestmentAmount(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
                    <span>{formatCurrency(monthlySaving)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="monthly-contribution"
                      min={0}
                      max={5000}
                      step={100}
                      value={[monthlySaving]}
                      onValueChange={(values) => setMonthlySaving(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={monthlySaving}
                      onChange={(e) => setMonthlySaving(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="return-rate">Expected Return Rate (%)</Label>
                    <span>{investmentReturn}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="return-rate"
                      min={0}
                      max={15}
                      step={0.1}
                      value={[investmentReturn]}
                      onValueChange={(values) => setInvestmentReturn(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={investmentReturn}
                      onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="years">Simulation Years</Label>
                    <span>{simulationYears} years</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="years"
                      min={1}
                      max={40}
                      step={1}
                      value={[simulationYears]}
                      onValueChange={(values) => setSimulationYears(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={simulationYears}
                      onChange={(e) => setSimulationYears(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRunSimulation} className="w-full bg-findt-primary">
                  Update Simulation
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2 card-shadow">
              <CardHeader>
                <CardTitle>Investment Growth Projection</CardTitle>
                <CardDescription>
                  Projected value after {simulationYears} years: {formatCurrency(projectedInvestmentValue)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`} 
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Projection at ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="withContributions" 
                      name="With Monthly Contributions"
                      stroke="#087E8B" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withoutContributions" 
                      name="Without Contributions"
                      stroke="#0B3954" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="income">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 card-shadow">
              <CardHeader>
                <CardTitle>Income Parameters</CardTitle>
                <CardDescription>Adjust your income scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Monthly Income</span>
                  <span className="font-semibold">{formatCurrency(baseIncome)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="salary-adjustment">Salary Adjustment (%)</Label>
                    <span>{salaryAdjustment > 0 ? `+${salaryAdjustment}` : salaryAdjustment}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="salary-adjustment"
                      min={-50}
                      max={100}
                      step={1}
                      value={[salaryAdjustment]}
                      onValueChange={(values) => setSalaryAdjustment(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={salaryAdjustment}
                      onChange={(e) => setSalaryAdjustment(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="simulation-years">Simulation Years</Label>
                    <span>{simulationYears} years</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="simulation-years"
                      min={1}
                      max={40}
                      step={1}
                      value={[simulationYears]}
                      onValueChange={(values) => setSimulationYears(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={simulationYears}
                      onChange={(e) => setSimulationYears(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="pt-4 space-y-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Monthly</p>
                      <p className="text-xl font-semibold">{formatCurrency(baseIncome)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adjusted Monthly</p>
                      <p className="text-xl font-semibold">{formatCurrency(adjustedMonthlyIncome)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Annual Tax</p>
                      <p className="text-xl font-semibold">{formatCurrency(currentTax)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Annual Tax</p>
                      <p className="text-xl font-semibold">{formatCurrency(projectedTax)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Difference</p>
                    <p className={`text-xl font-semibold ${projectedTax > currentTax ? 'text-findt-danger' : 'text-findt-success'}`}>
                      {projectedTax > currentTax ? '+' : ''}{formatCurrency(projectedTax - currentTax)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {projectedTax > currentTax 
                        ? `This represents an increase of ${((projectedTax - currentTax) / currentTax * 100).toFixed(1)}% in tax burden`
                        : `This represents a decrease of ${((currentTax - projectedTax) / currentTax * 100).toFixed(1)}% in tax burden`}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRunSimulation} className="w-full bg-findt-primary">
                  Update Simulation
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2 card-shadow">
              <CardHeader>
                <CardTitle>Income Projection</CardTitle>
                <CardDescription>
                  Projected annual income after {simulationYears} years: {formatCurrency(incomeProjectionData[simulationYears].adjustedSalary)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeProjectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis 
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`} 
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Annual Income at ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="baseSalary" 
                      name="Baseline (2% annual growth)"
                      stroke="#0B3954" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="adjustedSalary" 
                      name="Adjusted Salary"
                      stroke="#FF5A5F" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioSimulator;
