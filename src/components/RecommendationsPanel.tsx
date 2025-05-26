
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LightbulbIcon } from "lucide-react";
import { aiSuggestions } from '@/data/mockData';
import { toast } from '@/components/ui/sonner';

interface Suggestion {
  id: number;
  category: string;
  title: string;
  description: string;
  potentialSavings: number | string;
  difficulty: string;
  dismissed?: boolean;
  saved?: boolean;
}

const RecommendationsPanel: React.FC = () => {
  // State for tracking suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>(aiSuggestions);
  
  // Format currency
  const formatCurrency = (amount: number | string): string => {
    if (typeof amount === 'string') return amount;
    
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle dismissing a suggestion
  const handleDismiss = (id: number) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, dismissed: true }
          : suggestion
      )
    );
    
    toast.info("Suggestion dismissed", {
      description: "You can find it later in the Dismissed tab",
    });
  };
  
  // Handle saving a suggestion
  const handleSave = (id: number) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, saved: true }
          : suggestion
      )
    );
    
    toast.success("Suggestion saved", {
      description: "You can find it in the Saved tab",
    });
  };
  
  // Filter suggestions based on status
  const activeSuggestions = suggestions.filter(s => !s.dismissed && !s.saved);
  const savedSuggestions = suggestions.filter(s => s.saved);
  const dismissedSuggestions = suggestions.filter(s => s.dismissed);
  
  // Get total potential savings
  const getTotalSavings = (items: Suggestion[]): string => {
    const total = items
      .filter(item => typeof item.potentialSavings === 'number')
      .reduce((sum, item) => sum + (item.potentialSavings as number), 0);
    
    return formatCurrency(total);
  };
  
  // Group suggestions by category
  const getByCategoryCount = (items: Suggestion[]): Record<string, number> => {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
  
  const categoryColors: Record<string, string> = {
    'Tax': 'bg-findt-primary text-white',
    'Savings': 'bg-findt-secondary text-white',
    'Investment': 'bg-findt-success text-white',
    'Budget': 'bg-findt-warning text-white',
    'Mortgage': 'bg-findt-accent text-white',
    'Retirement': 'bg-findt-muted text-white',
  };
  
  const difficultyColors: Record<string, string> = {
    'Easy': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Hard': 'bg-red-100 text-red-800 border-red-200',
  };
  
  const renderSuggestionList = (items: Suggestion[], showActions: boolean = true) => (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((suggestion) => (
          <Card key={suggestion.id} className="overflow-hidden card-shadow">
            <div className="flex justify-between items-start p-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className={categoryColors[suggestion.category] || 'bg-gray-500'}>
                    {suggestion.category}
                  </Badge>
                  <Badge variant="outline" className={difficultyColors[suggestion.difficulty] || ''}>
                    {suggestion.difficulty}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Potential savings: </span>
                  <span className="text-findt-success font-bold">
                    {formatCurrency(suggestion.potentialSavings)}
                    {typeof suggestion.potentialSavings === 'number' && '/year'}
                  </span>
                </div>
              </div>
            </div>
            {showActions && (
              <div className="bg-gray-50 px-4 py-2 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDismiss(suggestion.id)}
                >
                  Dismiss
                </Button>
                <Button 
                  size="sm"
                  className="bg-findt-primary"
                  onClick={() => handleSave(suggestion.id)}
                >
                  Save
                </Button>
              </div>
            )}
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No suggestions available.</p>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LightbulbIcon className="h-6 w-6 text-findt-primary" />
        <h2 className="text-2xl font-bold">Personalized Recommendations</h2>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active" className="relative">
              Active
              {activeSuggestions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-findt-accent rounded-full w-5 h-5 text-xs flex items-center justify-center text-white">
                  {activeSuggestions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>
          
          <div className="text-sm font-medium">
            Potential savings: <span className="text-findt-success">{getTotalSavings(activeSuggestions)}/year</span>
          </div>
        </div>
        
        <TabsContent value="active">
          {renderSuggestionList(activeSuggestions)}
        </TabsContent>
        
        <TabsContent value="saved">
          {renderSuggestionList(savedSuggestions, false)}
        </TabsContent>
        
        <TabsContent value="dismissed">
          {renderSuggestionList(dismissedSuggestions, false)}
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Recommendations by Category</CardTitle>
            <CardDescription>Breakdown of optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(getByCategoryCount(suggestions)).map(([category, count]) => (
              <div key={category} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category}</span>
                  <Badge className={categoryColors[category] || 'bg-gray-500'}>
                    {count} suggestion{count !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${categoryColors[category].includes('bg-findt-') ? 
                      categoryColors[category].split(' ')[0] : 'bg-gray-500'}`} 
                    style={{ width: `${(count / suggestions.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {Math.round((count / suggestions.length) * 100)}% of total recommendations
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Implementation Guide</CardTitle>
            <CardDescription>How to apply these recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Easy Wins First</h4>
              <p className="text-sm">
                Start with easier recommendations that provide immediate benefits with minimal effort.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-semibold">Focus on Highest Value</h4>
              <p className="text-sm">
                Prioritize recommendations with the highest potential savings for maximum impact.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-semibold">Create an Action Plan</h4>
              <p className="text-sm">
                Schedule specific times to implement saved recommendations in the coming weeks.
              </p>
            </div>
            
            <div className="mt-4">
              <Button className="w-full bg-findt-primary">
                Generate Implementation Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
