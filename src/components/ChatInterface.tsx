import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/sonner';
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message, ScenarioMode, FinancialParameters } from '@/types/chat';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import SampleQuestions from './chat/SampleQuestions';
import { supabase } from "@/integrations/supabase/client";
import { incomeSources, taxBrackets } from '@/data/mockData';
import { calculateTotalIncome, calculateTotalExpenses } from '@/utils/calculations';
import { v4 as uuidv4 } from 'uuid';
import { processShortResponse, detectContextFromHistory, extractRetirementTargets } from './chat/UserInputProcessor';
import { logger } from '@/utils/logger';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm an AI-powered financial assistant powered by Gemini. How can I help you with financial matters today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>('basic');
  const [scenarioQuestion, setScenarioQuestion] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>(uuidv4());
  const [lastContextPrompt, setLastContextPrompt] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getFinancialParameters = (): FinancialParameters => {
    const totalMonthlyIncome = calculateTotalIncome(incomeSources);
    return {
      incomeSources: incomeSources,
      totalMonthlyIncome: totalMonthlyIncome,
      scenarioMode: scenarioMode,
      monthlySavingsRate: 0.20,
      monthlyExpenses: 8000,
      netWorth: 250000,
      assets: [
        { type: "savings", value: 50000, currency: "CHF" },
        { type: "investments", value: 120000, currency: "CHF" },
        { type: "property", value: 450000, currency: "CHF" }
      ],
      liabilities: [
        { type: "mortgage", amount: 350000, interestRate: 0.035, currency: "CHF" },
        { type: "loans", amount: 20000, interestRate: 0.06, currency: "CHF" }
      ],
      taxRate: 0.25,
      retirementContributions: {
        monthly: 1000,
        currentBalance: 180000
      },
      mortgageParameters: {
        maxDebtToIncomeRatio: 0.33,
        propertyTaxRate: 0.01,
        propertyInsuranceRate: 0.005,
        hoaFees: 200,
        newMortgageInterestRate: 0.03,
        mortgageTermYears: 25,
        otherMonthlyDebtObligations: 500,
        downPaymentMinimumPercentage: 0.2
      },
      taxParameters: {
        taxBrackets: taxBrackets,
        availableDeductions: [
          { name: "Pillar 3a", amount: 6883 },
          { name: "Professional Expenses", amount: 3000 },
          { name: "Health Insurance", amount: 2500 },
          { name: "Charitable Donations", amount: 2000 },
          { name: "Home Office", amount: 1800 }
        ],
        previousTaxPaid: 31500,
        pillar3aContribution: 5000, // Current annual contribution
        potentialCredits: [
          { name: "Energy-saving home improvements", amount: 3500 },
          { name: "Childcare expenses", amount: 0 },
          { name: "Education expenses", amount: 1200 }
        ]
      }
    };
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const previousUserMessage = messages.filter(m => m.sender === 'user').pop()?.content || '';
    const previousAiMessage = messages.filter(m => m.sender === 'assistant').pop()?.content || '';
    
    // Process the input to enhance context
    const processedInput = processShortResponse(input, previousUserMessage, previousAiMessage);
    const contextPrompt = detectContextFromHistory(messages, processedInput);
    
    // Extract retirement targets for better context
    const retirementTargets = extractRetirementTargets([...messages, {content: input, sender: 'user'}]);
    
    // Track the context prompt for logging
    setLastContextPrompt(contextPrompt || processedInput);
    
    // Determine which input to send to the AI
    const finalInput = contextPrompt || processedInput;
    
    const userMessage: Message = {
      id: messages.length + 1,
      content: input, // Show original input to the user
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    setIsTyping(true);
    
    try {
      const financialParameters = getFinancialParameters();
      
      // Add retirement targets to financial parameters if available
      if (retirementTargets.retirementAge || retirementTargets.currentAge || retirementTargets.retirementIncome) {
        financialParameters.retirementParameters = {
          ...(retirementTargets.currentAge && { currentAge: retirementTargets.currentAge }),
          ...(retirementTargets.retirementAge && { targetRetirementAge: retirementTargets.retirementAge }),
          ...(retirementTargets.retirementIncome && { targetAnnualIncome: retirementTargets.retirementIncome }),
        };
      }
      
      // Log the context enhancement for debugging
      logger.info('Original input:', input);
      logger.info('Processed input with context:', finalInput);
      
      if (retirementTargets.retirementAge || retirementTargets.currentAge || retirementTargets.retirementIncome) {
        logger.debug('Retirement targets detected:', retirementTargets);
      }
      
      const { data, error } = await supabase.functions.invoke('chat-gemini', {
        body: { 
          userMessage: finalInput, // Send enhanced input to the AI
          originalUserMessage: input, // Also send the original for context
          previousMessages: messages.slice(-6), // Send more recent messages for context
          financialParameters: financialParameters,
          conversationId: conversationId
        }
      });

      if (error) {
        console.error('Invoke error:', error);
        throw new Error(error.message);
      }
      
      if (data.error) {
        console.error('API error:', data.error, data.details);
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        content: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.id) {
        try {
          await supabase.from('chat_history').insert({
            user_id: session.session.user.id,
            message: input,
            response: data.response,
            context_prompt: finalInput !== input ? finalInput : null
          });
        } catch (error) {
          console.error('Failed to save chat history:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Response could not be retrieved: ${error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleScenarioMode = () => {
    const newMode = scenarioMode === 'basic' ? 'advanced' : 'basic';
    setScenarioMode(newMode);
    toast(newMode === 'advanced' 
      ? "AI will now provide more detailed financial analyses" 
      : "AI will now provide simpler financial explanations"
    );
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        content: "Hello! I'm an AI-powered financial assistant powered by Gemini. How can I help you with financial matters today?",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
    setConversationId(uuidv4());
    toast.success("Chat history cleared and new conversation started");
  };

  const submitScenarioQuestion = () => {
    if (scenarioQuestion.trim() === '') return;
    setInput(scenarioQuestion);
    setScenarioQuestion('');
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Assistant</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearChat}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>New Conversation</span>
        </Button>
      </div>
      
      <Card className="card-shadow border-findt-primary/10">
        <CardHeader className="bg-findt-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <CardTitle>Financial AI Assistant</CardTitle>
                <CardDescription className="text-white/80">
                  Ask questions about financial scenarios
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20"
              onClick={toggleScenarioMode}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>{scenarioMode === 'basic' ? 'Basic Mode' : 'Advanced Mode'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MessageList 
            messages={messages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
          />
        </CardContent>
        <CardFooter className="border-t p-3">
          <ChatInput 
            input={input}
            isTyping={isTyping}
            onInputChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onSendMessage={handleSendMessage}
          />
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SampleQuestions onSelectQuestion={setInput} />
        
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Scenario Planning</CardTitle>
            <CardDescription>Create specific financial scenarios for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea 
              placeholder="Describe your financial scenario or question in detail..."
              value={scenarioQuestion}
              onChange={(e) => setScenarioQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={submitScenarioQuestion} 
              disabled={scenarioQuestion.trim() === '' || isTyping}
              className="w-full flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze This Scenario</span>
            </Button>
            <div className="text-xs text-muted-foreground mt-2">
              <p>Tip: The more details you provide about your financial situation, the more accurate the analysis will be.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
