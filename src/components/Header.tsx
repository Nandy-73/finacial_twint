
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CreditCard, Calculator, PiggyBank, MessageSquare } from "lucide-react";

// Interface to pass the setActiveTab function as a prop
interface HeaderProps {
  setActiveTab?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (tab: string) => {
    // If we're already on the homepage and setActiveTab is available,
    // just change the tab
    if (setActiveTab) {
      setActiveTab(tab);
      
      // Also update the URL if needed
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <header className="bg-findt-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation('overview')}>
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold text-white">FinDT</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Button 
              variant="link" 
              className="text-white flex items-center space-x-1 hover:text-findt-light"
              onClick={() => handleNavigation('overview')}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <Button 
              variant="link" 
              className="text-white flex items-center space-x-1 hover:text-findt-light"
              onClick={() => handleNavigation('scenarios')}
            >
              <CreditCard className="h-4 w-4" />
              <span>Scenarios</span>
            </Button>
            <Button 
              variant="link" 
              className="text-white flex items-center space-x-1 hover:text-findt-light"
              onClick={() => handleNavigation('tax')}
            >
              <Calculator className="h-4 w-4" />
              <span>Tax</span>
            </Button>
            <Button 
              variant="link" 
              className="text-white flex items-center space-x-1 hover:text-findt-light"
              onClick={() => handleNavigation('property')}
            >
              <PiggyBank className="h-4 w-4" />
              <span>Property</span>
            </Button>
            <Button 
              variant="link" 
              className="text-white flex items-center space-x-1 hover:text-findt-light"
              onClick={() => handleNavigation('assistant')}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Assistant</span>
            </Button>
          </nav>
          
          <div className="hidden md:block">
            <Button 
              className="bg-findt-accent hover:bg-opacity-90 text-white"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
          </div>
          
          <Button variant="ghost" className="md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
