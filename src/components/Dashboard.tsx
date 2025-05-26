
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialOverview from './FinancialOverview';
import ScenarioSimulator from './ScenarioSimulator';
import TaxCalculator from './TaxCalculator';
import PropertySimulator from './PropertySimulator';
import BudgetOptimizer from './BudgetOptimizer';
import ChatInterface from './ChatInterface';
import RecommendationsPanel from './RecommendationsPanel';
import UserProfile from './UserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

interface DashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab: propsActiveTab, setActiveTab: propsSetActiveTab }) => {
  const [internalActiveTab, setInternalActiveTab] = useState("overview");
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Use the activeTab from props if provided, otherwise use the internal state
  const activeTab = propsActiveTab || internalActiveTab;
  const setActiveTab = propsSetActiveTab || setInternalActiveTab;
  
  // Check if a tab was specified in the navigation state
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state after using it to prevent it from persisting
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setActiveTab]);
  
  // Log state for debugging
  useEffect(() => {
    console.log("Dashboard active tab:", activeTab);
  }, [activeTab]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">FinDT Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Welcome, {user?.user_metadata?.first_name || 'User'}</span>
          <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-8 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="assistant">Assistant</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FinancialOverview />
        </TabsContent>
        
        <TabsContent value="scenarios">
          <ScenarioSimulator />
        </TabsContent>
        
        <TabsContent value="tax">
          <TaxCalculator />
        </TabsContent>
        
        <TabsContent value="property">
          <PropertySimulator />
        </TabsContent>
        
        <TabsContent value="budget">
          <BudgetOptimizer />
        </TabsContent>
        
        <TabsContent value="assistant">
          <ChatInterface />
        </TabsContent>
        
        <TabsContent value="recommendations">
          <RecommendationsPanel />
        </TabsContent>
        
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
