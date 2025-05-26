
import React, { useState } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-findt-light flex flex-col">
      <Header setActiveTab={setActiveTab} />
      <main className="flex-grow">
        <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
      <footer className="bg-findt-primary text-white py-4 text-center text-sm">
        <p>FinDT: Financial Digital Twin - A prototype for Swiss financial planning</p>
      </footer>
    </div>
  );
};

export default Index;
