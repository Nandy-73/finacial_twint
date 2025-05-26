
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced conversation history store with persistent memory
const conversationHistories = new Map<string, Array<{role: string, text: string, metadata?: any}>>();

// Maximum number of messages to retain in history for context
const MAX_HISTORY_LENGTH = 30;

// Track the most recent topics discussed to help with pronoun resolution
const conversationTopics = new Map<string, string[]>();
const MAX_TOPICS = 10;

// Track conversation state and ongoing calculations
const conversationState = new Map<string, {
  activeCalculation?: string;
  lastQuestion?: string;
  pendingConfirmation?: boolean;
  calculationContext?: Record<string, any>;
  lastValueMentioned?: string | number; // Track the last numeric value mentioned
  lastPropertyDiscussed?: string; // Track property discussions 
  lastIncomeDiscussed?: number; // Track income discussions
  pendingInputs?: string[]; // Track expected inputs
  retirementContext?: {
    currentAge?: number;
    targetRetirementAge?: number;
    targetAnnualIncome?: number;
    timeframe?: number;
  };
}>();

// Track conversation subject focus for better contextual understanding
const conversationFocus = new Map<string, {
  mainTopic?: string;
  subTopics?: string[];
  recentValues?: Array<{value: string | number, context: string}>;
  lastQuestionAnswered?: boolean;
}>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, originalUserMessage, previousMessages, financialParameters, conversationId } = await req.json();
    
    // Initialize or retrieve conversation history
    if (!conversationHistories.has(conversationId)) {
      conversationHistories.set(conversationId, []);
      conversationTopics.set(conversationId, []);
      conversationState.set(conversationId, {});
      conversationFocus.set(conversationId, {});
    }
    
    const history = conversationHistories.get(conversationId)!;
    const topics = conversationTopics.get(conversationId)!;
    const state = conversationState.get(conversationId)!;
    const focus = conversationFocus.get(conversationId)!;
    
    // Log incoming message with context
    console.log(`Incoming message: "${userMessage}"`);
    console.log(`Original user message: "${originalUserMessage}"`);
    if (userMessage !== originalUserMessage) {
      console.log(`Enhanced context detected: "${userMessage}"`);
    }
    
    // Process retirement context from financial parameters
    if (financialParameters?.retirementParameters) {
      state.retirementContext = {
        currentAge: financialParameters.retirementParameters.currentAge,
        targetRetirementAge: financialParameters.retirementParameters.targetRetirementAge,
        targetAnnualIncome: financialParameters.retirementParameters.targetAnnualIncome,
        timeframe: financialParameters.retirementParameters.targetRetirementAge && 
                 financialParameters.retirementParameters.currentAge ? 
                 financialParameters.retirementParameters.targetRetirementAge - 
                 financialParameters.retirementParameters.currentAge : undefined
      };
      
      if (state.retirementContext.currentAge && state.retirementContext.targetRetirementAge) {
        console.log(`Retirement context: Age ${state.retirementContext.currentAge}, target retirement at ${state.retirementContext.targetRetirementAge}`);
        if (state.retirementContext.targetAnnualIncome) {
          console.log(`Target retirement income: CHF ${state.retirementContext.targetAnnualIncome} per year`);
        }
        if (state.retirementContext.timeframe) {
          console.log(`Retirement timeframe: ${state.retirementContext.timeframe} years`);
        }
      }
    }
    
    // Special handling for potential numeric/financial values
    let isValueResponse = false;
    
    // Check if it's a short confirmation or value response
    const isShortInput = originalUserMessage && originalUserMessage.trim().split(/\s+/).length <= 3;
    const numericMatch = originalUserMessage.match(/^[\d,.]+[kmKM]?$|^\d+(\.\d+)?%$/);
    
    // Extract age information
    const ageMatch = originalUserMessage.match(/\b(\d+)\s*(?:years?\s*old|yrs?\s*old|years?)\b/i) ||
                    originalUserMessage.match(/\bam\s*(\d+)\b/i) ||
                    originalUserMessage.match(/\bage\s*(?:is|of|:|=)?\s*(\d+)\b/i);
    
    if (ageMatch && ageMatch[1]) {
      const age = parseInt(ageMatch[1], 10);
      if (age > 0 && age < 120) { // Validate reasonable age
        console.log(`Age detected: ${age} years`);
        state.retirementContext = {
          ...state.retirementContext,
          currentAge: age
        };
        
        // Update timeframe if we have target retirement age
        if (state.retirementContext && state.retirementContext.targetRetirementAge) {
          state.retirementContext.timeframe = state.retirementContext.targetRetirementAge - age;
          console.log(`Updated retirement timeframe: ${state.retirementContext.timeframe} years`);
        }
      }
    }
    
    // Extract retirement age
    const retireAgeMatch = userMessage.match(/retire\s+(?:at\s+)?(?:age\s+)?(\d+)/i);
    if (retireAgeMatch && retireAgeMatch[1]) {
      const retireAge = parseInt(retireAgeMatch[1], 10);
      console.log(`Retirement age detected: ${retireAge}`);
      state.retirementContext = {
        ...state.retirementContext,
        targetRetirementAge: retireAge
      };
      
      // Update timeframe if we have current age
      if (state.retirementContext && state.retirementContext.currentAge) {
        state.retirementContext.timeframe = retireAge - state.retirementContext.currentAge;
        console.log(`Updated retirement timeframe: ${state.retirementContext.timeframe} years`);
      }
    }
    
    // Extract retirement income
    const incomeMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*k\s*(?:chf|per\s+year)/i);
    if (incomeMatch && incomeMatch[1]) {
      const income = parseFloat(incomeMatch[1]) * 1000;
      console.log(`Retirement income detected: CHF ${income}`);
      state.retirementContext = {
        ...state.retirementContext,
        targetAnnualIncome: income
      };
    }
    
    if (isShortInput) {
      console.log(`Short input detected: "${originalUserMessage}"`);
      
      // Check for short confirmation
      const isShortConfirmation = /^(yes|yeah|sure|ok|proceed|continue|go ahead)$/i.test(originalUserMessage.toLowerCase().trim());
      
      // Check for value input (number, currency, percentage)
      if (numericMatch) {
        isValueResponse = true;
        console.log(`Value response detected: "${originalUserMessage}"`);
        
        // Extract value for context
        let value = originalUserMessage;
        state.lastValueMentioned = value;
        
        // Check if this might be a property value
        if (state.activeCalculation?.includes("property") || 
            state.activeCalculation?.includes("mortgage") ||
            state.lastPropertyDiscussed) {
          state.lastPropertyDiscussed = value;
          console.log(`Setting property value context: ${value}`);
        }
        
        // Check if this might be an income value
        if (state.activeCalculation?.includes("income") ||
            state.activeCalculation?.includes("salary") ||
            state.pendingInputs?.includes("income")) {
          state.lastIncomeDiscussed = parseFloat(value.replace(/[^\d.]/g, ''));
          console.log(`Setting income value context: ${value}`);
        }
      }
      
      // Handle short confirmation and track context
      if (isShortConfirmation && state.pendingConfirmation && state.activeCalculation) {
        console.log(`Detected confirmation for pending calculation: ${state.activeCalculation}`);
        
        // Add context to the user's short reply to help the model understand
        const enhancedMessage = `Yes, please ${state.activeCalculation} as you suggested in your previous message.`;
        history.push({ 
          role: 'user', 
          text: enhancedMessage,
          metadata: {
            originalInput: originalUserMessage,
            context: state.activeCalculation
          }
        });
        
        // Also track the original message for logging
        console.log(`Original message: "${originalUserMessage}" enhanced to: "${enhancedMessage}"`);
      } else if (isValueResponse) {
        // This is a value response, enhance with context
        const enhancedValueMessage = `For the ${state.activeCalculation || "calculation"} you asked about, the value is ${originalUserMessage}`;
        history.push({
          role: 'user',
          text: enhancedValueMessage,
          metadata: {
            originalInput: originalUserMessage,
            isValueInput: true,
            valueContext: state.activeCalculation
          }
        });
        console.log(`Value input: "${originalUserMessage}" enhanced to: "${enhancedValueMessage}"`);
      } else {
        // Add user message to history as provided (already enhanced by frontend)
        history.push({ 
          role: 'user', 
          text: userMessage,
          metadata: {
            originalInput: originalUserMessage
          } 
        });
      }
    } else {
      // Extract potential topics from the user message
      const potentialTopics = extractTopics(userMessage);
      if (potentialTopics.length > 0) {
        // Add new topics to the front of the array
        topics.unshift(...potentialTopics);
        // Keep only the most recent MAX_TOPICS
        if (topics.length > MAX_TOPICS) {
          topics.splice(MAX_TOPICS);
        }
      }
      
      // Update conversation state based on message content
      updateConversationState(userMessage, state);
      
      // Add user message to history
      history.push({ 
        role: 'user', 
        text: userMessage,
        metadata: {
          originalInput: originalUserMessage
        }
      });
    }
    
    // Enhanced financial context focusing on mortgage calculations
    const mortgageContext = financialParameters.mortgageParameters ? 
      `For mortgage calculations, use these exact parameters:
- Maximum debt-to-income ratio: ${financialParameters.mortgageParameters.maxDebtToIncomeRatio}
- Property tax rate: ${financialParameters.mortgageParameters.propertyTaxRate}
- Property insurance rate: ${financialParameters.mortgageParameters.propertyInsuranceRate}
- Monthly HOA fees: CHF ${financialParameters.mortgageParameters.hoaFees}
- New mortgage interest rate: ${financialParameters.mortgageParameters.newMortgageInterestRate}
- Mortgage term: ${financialParameters.mortgageParameters.mortgageTermYears} years
- Other monthly debt obligations: CHF ${financialParameters.mortgageParameters.otherMonthlyDebtObligations}
- Required minimum down payment: ${financialParameters.mortgageParameters.downPaymentMinimumPercentage * 100}%
- Monthly income: CHF ${financialParameters.totalMonthlyIncome}` : 
      'No mortgage parameters available for calculations.';
    
    // Tax context with detailed tax information
    const taxContext = financialParameters.taxParameters ? 
      `For tax calculations, use these exact parameters:
- Current tax rate: ${financialParameters.taxRate * 100}%
- Annual income: CHF ${financialParameters.totalMonthlyIncome * 12}
- Available tax deductions: ${financialParameters.taxParameters.availableDeductions.map(d => `${d.name}: CHF ${d.amount}`).join(', ')}
- Tax brackets: ${financialParameters.taxParameters.taxBrackets.map(b => `${b.min}-${b.max}: ${b.rate * 100}%`).join(', ')}
- Previous tax paid: ${financialParameters.taxParameters.previousTaxPaid}
- Potential tax credits: ${financialParameters.taxParameters.potentialCredits.map(c => `${c.name}: CHF ${c.amount}`).join(', ')}
- Retirement contributions: Pillar 2: CHF ${financialParameters.retirementContributions.monthly * 12}, Pillar 3a: CHF ${financialParameters.taxParameters.pillar3aContribution || 0}` : 
      'No detailed tax parameters available for calculations.';
    
    // Create a specific retirement context section if age info was detected
    let retirementContext = '';
    if (state.retirementContext) {
      retirementContext = `RETIREMENT PLANNING CONTEXT:`;
      
      if (state.retirementContext.currentAge) {
        retirementContext += `\n- Current age: ${state.retirementContext.currentAge} years`;
      }
      
      if (state.retirementContext.targetRetirementAge) {
        retirementContext += `\n- Target retirement age: ${state.retirementContext.targetRetirementAge} years`;
      }
      
      if (state.retirementContext.timeframe) {
        retirementContext += `\n- Years until retirement: ${state.retirementContext.timeframe} years`;
      }
      
      if (state.retirementContext.targetAnnualIncome) {
        retirementContext += `\n- Target retirement income: CHF ${state.retirementContext.targetAnnualIncome} per year`;
      }
      
      retirementContext += `\n- Current retirement savings: CHF ${financialParameters.retirementContributions.currentBalance}`;
      retirementContext += `\n- Monthly retirement contributions: CHF ${financialParameters.retirementContributions.monthly}`;
      retirementContext += `\n- Monthly income: CHF ${financialParameters.totalMonthlyIncome}`;
      retirementContext += `\n- Monthly expenses: CHF ${financialParameters.monthlyExpenses}`;
      retirementContext += `\n- Monthly savings rate: ${financialParameters.monthlySavingsRate * 100}%`;
    }
    
    // Format financial parameters as context
    const financialContext = financialParameters ? 
      `Use ONLY this verified financial data for your calculations:\n${JSON.stringify(financialParameters, null, 2)}\n\n${mortgageContext}\n\n${taxContext}\n\n${retirementContext}` : 
      'No financial data provided. I cannot perform calculations without specific financial data.';
    
    // Create context awareness for pronoun resolution
    const recentTopicsContext = topics.length > 0 ? 
      `Recent topics discussed: ${topics.join(', ')}. If the user refers to "it" or uses other pronouns, assume they're referring to one of these topics.` : 
      '';
    
    // Add state-specific context
    let stateContext = '';
    if (state.activeCalculation) {
      stateContext = `The user is currently interested in: ${state.activeCalculation}.`;
      if (state.calculationContext) {
        stateContext += ` Relevant values for this calculation: ${JSON.stringify(state.calculationContext)}.`;
      }
      if (state.lastPropertyDiscussed) {
        stateContext += ` The user mentioned a property value of ${state.lastPropertyDiscussed}.`;
      }
      if (state.lastIncomeDiscussed) {
        stateContext += ` The user mentioned an income of CHF ${state.lastIncomeDiscussed}.`;
      }
      if (state.lastValueMentioned && isValueResponse) {
        stateContext += ` The user just provided a value of ${state.lastValueMentioned} in response to your question.`;
      }
    }
    
    // Create special handling for short responses
    let shortResponseContext = '';
    if (isShortInput) {
      const lastQuestion = getLastQuestion(history);
      if (lastQuestion) {
        shortResponseContext = `The user's message "${originalUserMessage}" is responding to your question: "${lastQuestion}". Process it in that context.`;
      } else {
        shortResponseContext = `The user has sent a short message: "${originalUserMessage}". It likely refers to the most recent topic discussed.`;
      }
    }
    
    // Enhanced system instruction for conversation memory and context maintenance
    const systemInstruction = `You are a precise financial calculator that:
1. ONLY uses the provided financialParameters - NEVER invent or assume numbers
2. For mortgage questions, ALWAYS use the mortgageParameters values provided
3. For tax questions, ALWAYS use the taxParameters values provided
4. Shows exact mathematical calculations step-by-step using the provided data
5. Clearly states "I need more information about X" if any required data is missing
6. Each response must reference specific numbers from financialParameters
7. Uses bullet points for calculations and multi-step answers
8. Only gives financial advice based on actual numbers in financialParameters
9. For mortgage calculations, always consider:
   - Monthly income and debt-to-income ratio
   - Property taxes and insurance
   - HOA fees
   - New mortgage interest rates
   - Minimum down payment requirements
10. For tax calculations, always consider:
   - Available deductions and credits
   - Tax brackets and progressive rates
   - Retirement contribution benefits
   - Potential tax optimization strategies
11. For retirement calculations, always consider:
   - Current age vs target retirement age
   - Years until retirement
   - Current retirement savings
   - Monthly contributions
   - Target retirement income
   - Withdrawal strategies and expected return rates
12. If asked in Turkish, respond in Turkish. Otherwise respond in English.

CONVERSATION CONTEXT:
${stateContext}
${recentTopicsContext}
${shortResponseContext}

CRITICAL CONVERSATION INSTRUCTIONS:
1. Maintain perfect conversation continuity - if the user says "yes" or gives a short confirmation, ALWAYS continue with the calculation or analysis you were previously discussing
2. If you previously asked a question, and the user gives a short reply, assume they are answering your question
3. NEVER lose track of the ongoing calculation or analysis
4. If you ask a question like "Would you like me to calculate X?" and the user says "yes", immediately perform that calculation without asking for more information
5. For ALL follow-up questions from the user, maintain the context of previous questions and answers
6. NEVER ask "What would you like to calculate?" when the calculation topic is already established
7. When the user uses pronouns like "it", "this", "that", look at recent topics and previous messages to understand the reference
8. If you're unsure about what the user is asking, reference their recent questions
9. When the user gives a short message like "1m chf", interpret it as a currency value of 1 million Swiss francs in the context of your previous question
10. For ANY numeric value without explicit context, look at your previous questions to understand what the user is referring to
11. If the user gives you a value without context, apply it to the most recently discussed financial topic or question

Remember:
- NEVER make assumptions about missing data
- ONLY use numbers from financialParameters except when the user explicitly provides new values
- ALWAYS show your calculations using provided data
- Keep responses focused on the actual numbers
- MAINTAIN FULL CONVERSATION CONTEXT across multiple messages
- ALWAYS interpret short inputs in the context of your previous questions`;
    
    // Format messages for Gemini API with all conversation history for context
    const messages = history.map(msg => ({
      parts: [{ text: msg.text }],
      role: msg.role === 'user' ? 'user' : 'model'
    }));
    
    console.log("Sending request to Gemini with enhanced financial parameters and conversation history");
    console.log(`History contains ${messages.length} messages`);
    console.log(`Current topics: ${topics.join(', ')}`);
    console.log(`Current state: ${JSON.stringify(state)}`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: {
            parts: [{ text: `${systemInstruction}\n${financialContext}` }]
          },
          generationConfig: {
            temperature: 0.0, // Reduced temperature for more consistent responses
            topP: 0.1,
            topK: 40,
            maxOutputTokens: 2048
          }
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    let aiResponse = '';
    
    if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
      aiResponse = data.candidates[0].content.parts[0].text;
      
      // Add assistant response to history (limit history to prevent context overflow)
      history.push({ role: 'model', text: aiResponse });
      
      // Extract potential topics from AI response to maintain context
      const aiResponseTopics = extractTopics(aiResponse);
      if (aiResponseTopics.length > 0) {
        // Add new topics from AI response
        topics.push(...aiResponseTopics.filter(t => !topics.includes(t)));
        // Keep only the most recent MAX_TOPICS
        if (topics.length > MAX_TOPICS) {
          topics.splice(MAX_TOPICS);
        }
      }
      
      // Update conversation state based on AI response
      updateStateFromAIResponse(aiResponse, state);
      
      // Keep history within MAX_HISTORY_LENGTH to prevent token limits while maintaining context
      if (history.length > MAX_HISTORY_LENGTH) {
        // Keep more recent messages for better context
        const trimCount = history.length - MAX_HISTORY_LENGTH;
        history.splice(1, trimCount);
      }
    } else {
      console.error('Unexpected response structure:', data);
      throw new Error('Failed to get a valid response from Gemini');
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-gemini function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process the request', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to extract potential topics from text
function extractTopics(text: string): string[] {
  // Enhanced implementation - extract nouns and financial terms with better context
  const financialTerms = [
    'mortgage', 'tax', 'income', 'expense', 'saving', 'investment', 'retirement',
    'property', 'debt', 'asset', 'liability', 'deduction', 'credit', 'rate',
    'pillar', 'contribution', 'bracket', 'return', 'portfolio', 'budget',
    'apartment', 'house', 'buy', 'rent', 'afford', 'payment', 'loan', 'salary',
    'chf', 'swiss franc', 'million', 'thousand', 'price', 'value', 'worth',
    'age', 'year old', 'years old', 'retire at', 'pension', 'withdraw'
  ];
  
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\W+/);
  
  // Extract financial terms
  for (const term of financialTerms) {
    if (lowerText.includes(term)) {
      topics.push(term);
    }
  }
  
  // Look for money amounts
  const moneyPattern = /(\d+\.?\d*)\s*(?:chf|k|m|million|thousand|francs?)/gi;
  let moneyMatch;
  while ((moneyMatch = moneyPattern.exec(lowerText)) !== null) {
    topics.push(`amount_${moneyMatch[1]}`);
  }
  
  // Look for age information
  const agePattern = /\b(\d+)\s*(?:years?\s*old|yrs?\s*old|years?)\b/i;
  const ageMatch = lowerText.match(agePattern);
  if (ageMatch && ageMatch[1]) {
    topics.push(`age_${ageMatch[1]}`);
  }
  
  // Look for retirement age
  const retireAgePattern = /retire\s+(?:at\s+)?(?:age\s+)?(\d+)/i;
  const retireMatch = lowerText.match(retireAgePattern);
  if (retireMatch && retireMatch[1]) {
    topics.push(`retire_age_${retireMatch[1]}`);
  }
  
  // Look for phrases like "tax deduction" or "mortgage payment"
  const phrases = lowerText.match(/[a-z]+ [a-z]+/g) || [];
  for (const phrase of phrases) {
    for (const term of financialTerms) {
      if (phrase.includes(term)) {
        topics.push(phrase);
      }
    }
  }
  
  return [...new Set(topics)]; // Remove duplicates
}

// Helper function to update conversation state based on user message
function updateConversationState(userMessage: string, state: any): void {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for age information
  const ageMatch = lowerMessage.match(/\b(\d+)\s*(?:years?\s*old|yrs?\s*old|years?)\b/i) ||
                   lowerMessage.match(/\bam\s*(\d+)\b/i) ||
                   lowerMessage.match(/\bage\s*(?:is|of|:|=)?\s*(\d+)\b/i);
  
  if (ageMatch && ageMatch[1]) {
    const age = parseInt(ageMatch[1], 10);
    if (age > 0 && age < 120) { // Reasonable age range
      state.retirementContext = {
        ...state.retirementContext,
        currentAge: age
      };
      
      // If we have target retirement age, calculate timeframe
      if (state.retirementContext && state.retirementContext.targetRetirementAge) {
        state.retirementContext.timeframe = state.retirementContext.targetRetirementAge - age;
      }
    }
  }
  
  // Check for retirement age
  const retireAgeMatch = lowerMessage.match(/retire\s+(?:at\s+)?(?:age\s+)?(\d+)/i);
  if (retireAgeMatch && retireAgeMatch[1]) {
    const retireAge = parseInt(retireAgeMatch[1], 10);
    state.retirementContext = {
      ...state.retirementContext,
      targetRetirementAge: retireAge
    };
    
    // If we have current age, calculate timeframe
    if (state.retirementContext && state.retirementContext.currentAge) {
      state.retirementContext.timeframe = retireAge - state.retirementContext.currentAge;
    }
  }
  
  // Check for retirement income
  const incomeMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*k\s*(?:chf|per\s+year)/i);
  if (incomeMatch && incomeMatch[1]) {
    const income = parseFloat(incomeMatch[1]) * 1000;
    state.retirementContext = {
      ...state.retirementContext,
      targetAnnualIncome: income
    };
  }
  
  // Check for property/mortgage related questions
  if (lowerMessage.includes('property') || lowerMessage.includes('mortgage') || lowerMessage.includes('house') || 
      lowerMessage.includes('apartment') || lowerMessage.includes('buy') || lowerMessage.includes('afford')) {
    state.activeCalculation = 'property affordability calculation';
    state.lastQuestion = userMessage;
    
    // Check if expecting a yes/no response
    if (userMessage.includes('?')) {
      state.pendingConfirmation = true;
      
      // Check what kind of input we're expecting next
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
          lowerMessage.includes('value') || lowerMessage.includes('worth')) {
        state.pendingInputs = ['property_value'];
      }
    } else {
      state.pendingConfirmation = false;
    }
    
    // Extract property value if present
    const propertyValueMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:m|million|mio|k|thousand)?/i);
    if (propertyValueMatch) {
      let value = parseFloat(propertyValueMatch[1]);
      const unit = propertyValueMatch[2]?.toLowerCase();
      
      if (unit && (unit === 'm' || unit.startsWith('m') || unit.includes('million'))) {
        value *= 1000000;
      } else if (unit && (unit === 'k' || unit.includes('thousand'))) {
        value *= 1000;
      }
      
      state.lastPropertyDiscussed = value;
    }
    
    // Extract relevant context if available
    if (lowerMessage.includes('income')) {
      const incomeMatch = lowerMessage.match(/income.*?([\d,]+)/i);
      if (incomeMatch) {
        state.calculationContext = {
          ...(state.calculationContext || {}),
          income: incomeMatch[1]
        };
        state.lastIncomeDiscussed = parseFloat(incomeMatch[1].replace(/[^\d.]/g, ''));
      }
    }
  }
  
  // Check for tax related questions
  else if (lowerMessage.includes('tax')) {
    state.activeCalculation = 'tax optimization';
    state.lastQuestion = userMessage;
    
    if (userMessage.includes('?')) {
      state.pendingConfirmation = true;
    } else {
      state.pendingConfirmation = false;
    }
  }
  
  // Check for investment related questions
  else if (lowerMessage.includes('invest') || lowerMessage.includes('portfolio')) {
    state.activeCalculation = 'investment portfolio analysis';
    state.lastQuestion = userMessage;
    
    if (userMessage.includes('?')) {
      state.pendingConfirmation = true;
    } else {
      state.pendingConfirmation = false;
    }
  }
  
  // Check for retirement related questions
  else if (lowerMessage.includes('retire') || lowerMessage.includes('pension') || lowerMessage.includes('retirement')) {
    state.activeCalculation = 'retirement planning';
    state.lastQuestion = userMessage;
    
    if (userMessage.includes('?')) {
      state.pendingConfirmation = true;
    } else {
      state.pendingConfirmation = false;
    }
  }
  
  // Extract all numbers from the message to remember values
  const numberMatches = userMessage.match(/\d+([.,]\d+)?(\s*[kmKM])?/g);
  if (numberMatches && numberMatches.length > 0) {
    // Process and store the last numeric value
    let lastNumericValue = numberMatches[numberMatches.length - 1];
    
    // Store for future reference
    state.lastValueMentioned = lastNumericValue;
  }
}

// Helper function to update state based on AI responses
function updateStateFromAIResponse(aiResponse: string, state: any): void {
  // Check if the AI is asking a question
  if (aiResponse.includes('?')) {
    state.pendingConfirmation = true;
    
    // Try to detect what kind of input the AI is expecting
    if (aiResponse.toLowerCase().includes('property')) {
      if (aiResponse.toLowerCase().includes('price') || 
          aiResponse.toLowerCase().includes('value') ||
          aiResponse.toLowerCase().includes('cost')) {
        state.pendingInputs = ['property_value'];
      }
    }
    
    if (aiResponse.toLowerCase().includes('income')) {
      state.pendingInputs = ['income'];
    }
    
    if (aiResponse.toLowerCase().includes('age') && !aiResponse.toLowerCase().includes('retirement age')) {
      state.pendingInputs = ['current_age'];
    }
    
    if (aiResponse.toLowerCase().includes('retirement') && aiResponse.toLowerCase().includes('age')) {
      state.pendingInputs = ['retirement_age'];
    }
  } else {
    state.pendingConfirmation = false;
  }
  
  // Check if response is concluding current calculation
  if (aiResponse.includes('In conclusion') || aiResponse.includes('To summarize') || 
      aiResponse.includes('In summary') || aiResponse.includes('Based on my analysis')) {
    state.activeCalculation = undefined;
    state.pendingConfirmation = false;
    state.pendingInputs = [];
  }
}

// Helper function to extract the last question from message history
function getLastQuestion(history: Array<{role: string, text: string}>): string | null {
  if (history.length === 0) return null;
  
  // Look for the most recent assistant message
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'model') {
      const text = history[i].text;
      
      // Split into sentences
      const sentences = text.split(/(?<=[.!?])\s+/);
      
      // Find the last question
      for (let j = sentences.length - 1; j >= 0; j--) {
        if (sentences[j].trim().endsWith('?')) {
          return sentences[j].trim();
        }
      }
    }
  }
  
  return null;
}

