
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { calculateBuyVsRent, calculateMortgagePayment } from '@/utils/calculations';
import { realEstateOptions } from '@/data/mockData';
import { toast } from '@/components/ui/sonner';
import { Home, TrendingUp, Calculator, ChartPie } from "lucide-react";

const PropertySimulator: React.FC = () => {
  // State for property values
  const [propertyValue, setPropertyValue] = useState(realEstateOptions.buyOptions.propertyValue);
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(
    realEstateOptions.buyOptions.downPaymentPercentage * 100
  );
  const [mortgageRate, setMortgageRate] = useState(
    realEstateOptions.buyOptions.mortgageRate * 100
  );
  const [mortgageTermYears, setMortgageTermYears] = useState(
    realEstateOptions.buyOptions.mortgageTermYears
  );
  
  // State for rent values
  const [monthlyRent, setMonthlyRent] = useState(
    realEstateOptions.rentOptions.currentMonthlyRent
  );
  const [rentIncrease, setRentIncrease] = useState(
    realEstateOptions.rentOptions.annualRentIncrease * 100
  );
  
  // State for the analysis period
  const [analysisPeriod, setAnalysisPeriod] = useState(10);
  
  // Calculate results
  const downPaymentAmount = propertyValue * (downPaymentPercentage / 100);
  const loanAmount = propertyValue - downPaymentAmount;
  const monthlyMortgagePayment = calculateMortgagePayment(
    loanAmount,
    mortgageRate / 100,
    mortgageTermYears
  );
  
  // Calculate additional costs
  const propertyTax = propertyValue * realEstateOptions.buyOptions.propertyTaxRate;
  const annualHomeInsurance = realEstateOptions.buyOptions.homeInsurance;
  const annualMaintenance = propertyValue * realEstateOptions.buyOptions.maintenanceCosts;
  
  const totalMonthlyOwnershipCost = monthlyMortgagePayment + 
    (propertyTax + annualHomeInsurance + annualMaintenance) / 12;
  
  // Calculate buy vs rent comparison
  const buyVsRentAnalysis = calculateBuyVsRent(
    analysisPeriod,
    {
      currentMonthlyRent: monthlyRent,
      annualRentIncrease: rentIncrease / 100,
      rentalInsurance: realEstateOptions.rentOptions.rentalInsurance
    },
    {
      propertyValue: propertyValue,
      downPaymentPercentage: downPaymentPercentage / 100,
      mortgageRate: mortgageRate / 100,
      mortgageTermYears: mortgageTermYears,
      propertyTaxRate: realEstateOptions.buyOptions.propertyTaxRate,
      homeInsurance: realEstateOptions.buyOptions.homeInsurance,
      maintenanceCosts: realEstateOptions.buyOptions.maintenanceCosts,
      estimatedAppreciationRate: realEstateOptions.buyOptions.estimatedAppreciationRate
    }
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
  
  // Generate data for charts
  const generateCostBreakdownChart = () => {
    return [
      { name: 'Mortgage', value: monthlyMortgagePayment },
      { name: 'Property Tax', value: propertyTax / 12 },
      { name: 'Insurance', value: annualHomeInsurance / 12 },
      { name: 'Maintenance', value: annualMaintenance / 12 }
    ];
  };
  
  const generateCumulativeCostChart = () => {
    const data = [];
    let cumulativeRentCost = 0;
    let cumulativeBuyCost = downPaymentAmount;
    let currentRent = monthlyRent;
    
    for (let year = 0; year <= analysisPeriod; year++) {
      if (year > 0) {
        // Rent costs include annual increases
        cumulativeRentCost += (currentRent * 12) + realEstateOptions.rentOptions.rentalInsurance;
        currentRent *= (1 + rentIncrease / 100);
        
        // Buy costs include mortgage, taxes, insurance, and maintenance
        const yearlyPropertyValue = propertyValue * 
          Math.pow(1 + realEstateOptions.buyOptions.estimatedAppreciationRate, year);
        
        const yearlyPropertyTax = yearlyPropertyValue * realEstateOptions.buyOptions.propertyTaxRate;
        const yearlyMaintenance = yearlyPropertyValue * realEstateOptions.buyOptions.maintenanceCosts;
        
        cumulativeBuyCost += (monthlyMortgagePayment * 12) + 
          yearlyPropertyTax + 
          annualHomeInsurance + 
          yearlyMaintenance;
      }
      
      data.push({
        year: year,
        rent: cumulativeRentCost,
        buy: cumulativeBuyCost
      });
    }
    
    return data;
  };
  
  const costBreakdownData = generateCostBreakdownChart();
  const cumulativeCostData = generateCumulativeCostChart();
  
  // Chart colors
  const COLORS = ['#0B3954', '#087E8B', '#5AAA95', '#FF5A5F'];
  
  const handleRunAnalysis = () => {
    toast.success("Property analysis updated", {
      description: `Monthly ownership cost: ${formatCurrency(totalMonthlyOwnershipCost)}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Real Estate Planning</h2>
      
      <Tabs defaultValue="mortgage" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="mortgage">Mortgage Calculator</TabsTrigger>
          <TabsTrigger value="comparison">Rent vs. Buy Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mortgage">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 card-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mortgage Calculator</CardTitle>
                  <Home className="h-5 w-5 text-findt-primary" />
                </div>
                <CardDescription>Calculate your mortgage payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="property-value">Property Value</Label>
                    <span>{formatCurrency(propertyValue)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="property-value"
                      min={100000}
                      max={2000000}
                      step={10000}
                      value={[propertyValue]}
                      onValueChange={(values) => setPropertyValue(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="down-payment">Down Payment (%)</Label>
                    <span>{downPaymentPercentage}% ({formatCurrency(downPaymentAmount)})</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="down-payment"
                      min={10}
                      max={50}
                      step={1}
                      value={[downPaymentPercentage]}
                      onValueChange={(values) => setDownPaymentPercentage(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={downPaymentPercentage}
                      onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="mortgage-rate">Interest Rate (%)</Label>
                    <span>{mortgageRate}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="mortgage-rate"
                      min={0.5}
                      max={7}
                      step={0.1}
                      value={[mortgageRate]}
                      onValueChange={(values) => setMortgageRate(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={mortgageRate}
                      onChange={(e) => setMortgageRate(Number(e.target.value))}
                      className="w-24"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="mortgage-term">Mortgage Term (Years)</Label>
                    <span>{mortgageTermYears} years</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="mortgage-term"
                      min={5}
                      max={30}
                      step={1}
                      value={[mortgageTermYears]}
                      onValueChange={(values) => setMortgageTermYears(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={mortgageTermYears}
                      onChange={(e) => setMortgageTermYears(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRunAnalysis} className="w-full bg-findt-primary">
                  Calculate
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2 card-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mortgage Results</CardTitle>
                  <Calculator className="h-5 w-5 text-findt-primary" />
                </div>
                <CardDescription>
                  Loan Amount: {formatCurrency(loanAmount)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-findt-light rounded-lg p-4">
                      <h4 className="text-sm text-muted-foreground mb-1">Monthly Payment</h4>
                      <p className="text-2xl font-bold">{formatCurrency(monthlyMortgagePayment)}</p>
                    </div>
                    <div className="bg-findt-light rounded-lg p-4">
                      <h4 className="text-sm text-muted-foreground mb-1">Total Monthly Cost</h4>
                      <p className="text-2xl font-bold">{formatCurrency(totalMonthlyOwnershipCost)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Includes taxes and insurance</p>
                    </div>
                    <div className="bg-findt-light rounded-lg p-4">
                      <h4 className="text-sm text-muted-foreground mb-1">Total Interest</h4>
                      <p className="text-2xl font-bold">{formatCurrency(monthlyMortgagePayment * mortgageTermYears * 12 - loanAmount)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Monthly Cost Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Mortgage Payment</span>
                          <span className="font-medium">{formatCurrency(monthlyMortgagePayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Property Tax</span>
                          <span className="font-medium">{formatCurrency(propertyTax / 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Home Insurance</span>
                          <span className="font-medium">{formatCurrency(annualHomeInsurance / 12)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maintenance</span>
                          <span className="font-medium">{formatCurrency(annualMaintenance / 12)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total Monthly Cost</span>
                          <span>{formatCurrency(totalMonthlyOwnershipCost)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-[200px]">
                      <h4 className="font-semibold mb-3">Cost Distribution</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={costBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {costBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 card-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Rent vs. Buy Analysis</CardTitle>
                  <ChartPie className="h-5 w-5 text-findt-primary" />
                </div>
                <CardDescription>Compare long-term costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-rent">Monthly Rent</Label>
                  <Input
                    id="monthly-rent"
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="rent-increase">Annual Rent Increase (%)</Label>
                    <span>{rentIncrease}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="rent-increase"
                      min={0}
                      max={10}
                      step={0.1}
                      value={[rentIncrease]}
                      onValueChange={(values) => setRentIncrease(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={rentIncrease}
                      onChange={(e) => setRentIncrease(Number(e.target.value))}
                      className="w-24"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="analysis-period">Analysis Period (Years)</Label>
                    <span>{analysisPeriod} years</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      id="analysis-period"
                      min={5}
                      max={30}
                      step={1}
                      value={[analysisPeriod]}
                      onValueChange={(values) => setAnalysisPeriod(values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={analysisPeriod}
                      onChange={(e) => setAnalysisPeriod(Number(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="pt-4 space-y-4 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rent Cost</p>
                      <p className="text-xl font-semibold">{formatCurrency(buyVsRentAnalysis.rentTotalCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Buy Cost</p>
                      <p className="text-xl font-semibold">{formatCurrency(buyVsRentAnalysis.buyTotalCost)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Net Cost After Selling</p>
                    <p className="text-xl font-semibold">{formatCurrency(buyVsRentAnalysis.buyNetCost)}</p>
                    <p className="text-xs text-muted-foreground">
                      After considering equity and property appreciation
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Financial Advantage</p>
                    <p className={`text-xl font-semibold ${buyVsRentAnalysis.buySavings > 0 ? 'text-findt-success' : 'text-findt-danger'}`}>
                      {buyVsRentAnalysis.buySavings > 0 ? 'Buy: ' : 'Rent: '} 
                      {formatCurrency(Math.abs(buyVsRentAnalysis.buySavings))}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleRunAnalysis} className="w-full bg-findt-primary">
                  Update Analysis
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="lg:col-span-2 card-shadow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cost Comparison Over Time</CardTitle>
                  <TrendingUp className="h-5 w-5 text-findt-primary" />
                </div>
                <CardDescription>
                  Cumulative costs of renting vs. buying over {analysisPeriod} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis 
                        tickFormatter={(value) => `${Math.round(value / 1000)}k`} 
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Year ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="rent" 
                        name="Cumulative Rent Cost" 
                        stroke="#FF5A5F" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="buy" 
                        name="Cumulative Buy Cost" 
                        stroke="#0B3954" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Property Value After {analysisPeriod} Years</h4>
                    <p className="text-xl">{formatCurrency(buyVsRentAnalysis.propertyValueAtEnd)}</p>
                    <p className="text-sm text-muted-foreground">
                      Assuming {realEstateOptions.buyOptions.estimatedAppreciationRate * 100}% annual appreciation
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Equity Built After {analysisPeriod} Years</h4>
                    <p className="text-xl">{formatCurrency(buyVsRentAnalysis.equityBuilt)}</p>
                    <p className="text-sm text-muted-foreground">
                      Property value minus remaining mortgage
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertySimulator;
