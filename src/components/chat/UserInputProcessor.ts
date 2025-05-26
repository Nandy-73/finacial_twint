
/**
 * Processes user input to enhance context for AI responses
 */

// Common financial topics that might be referenced in short responses
const FINANCIAL_TOPICS = [
  { keywords: ['property', 'house', 'apartment', 'mortgage'], context: 'real estate or mortgage calculation' },
  { keywords: ['invest', 'stock', 'bond', 'portfolio'], context: 'investment planning' },
  { keywords: ['tax', 'deduction', 'credit'], context: 'tax planning' },
  { keywords: ['retire', 'pension', 'pillar'], context: 'retirement planning' },
  { keywords: ['budget', 'spend', 'save'], context: 'budget management' },
  { keywords: ['income', 'salary', 'earn'], context: 'income analysis' },
  { keywords: ['debt', 'loan', 'credit'], context: 'debt management' },
  { keywords: ['age', 'year', 'old'], context: 'age information' },
];

// Common financial value formats
const VALUE_PATTERNS = [
  { regex: /^\d+(\.\d+)?$/, type: 'number' },
  { regex: /^(\d+(\.\d+)?)[kK]$/, type: 'thousand', multiplier: 1000 },
  { regex: /^(\d+(\.\d+)?)[mM]$/, type: 'million', multiplier: 1000000 },
  { regex: /^(\d+(\.\d+)?)%$/, type: 'percentage' },
];

// Age-related patterns
const AGE_PATTERNS = [
  { regex: /\b(\d+)\s*(?:years?\s*old|yrs?\s*old)\b/i, group: 1 },
  { regex: /\bam\s*(\d+)\b/i, group: 1 },
  { regex: /\bage\s*(?:is|of|:|=)?\s*(\d+)\b/i, group: 1 },
  { regex: /\b(\d+)\s*(?:years?|yrs?)\b/i, group: 1 },
];

/**
 * Processes short user responses to add context
 */
export const processShortResponse = (
  input: string, 
  previousUserMessage: string, 
  previousAiMessage: string
): string => {
  const trimmedInput = input.trim();
  
  // If it's not a short response, return as is
  if (trimmedInput.split(/\s+/).length > 5) {
    return trimmedInput;
  }
  
  // Check if this might be age information
  for (const pattern of AGE_PATTERNS) {
    const match = trimmedInput.match(pattern.regex);
    if (match && match[pattern.group]) {
      const age = parseInt(match[pattern.group]);
      if (age > 0 && age < 120) { // Reasonable age range
        return `My age is ${age} years old. Please use this information for any retirement or financial planning calculations.`;
      }
    }
  }
  
  // Check if this might be a financial value
  for (const pattern of VALUE_PATTERNS) {
    if (pattern.regex.test(trimmedInput)) {
      // It's likely a financial value, check the previous AI message for context
      const lastAiQuestion = extractLastQuestion(previousAiMessage);
      if (lastAiQuestion) {
        return `Regarding your question "${lastAiQuestion}", my answer is: ${trimmedInput}`;
      }
    }
  }
  
  // Check for yes/no/confirmation responses
  if (/^(yes|no|yeah|nope|sure|ok|correct|right|exactly|confirm|agree)$/i.test(trimmedInput)) {
    const lastAiQuestion = extractLastQuestion(previousAiMessage);
    if (lastAiQuestion) {
      return `${trimmedInput.charAt(0).toUpperCase() + trimmedInput.slice(1)}, regarding your question "${lastAiQuestion}"`;
    }
  }
  
  // Check topic continuity
  for (const topic of FINANCIAL_TOPICS) {
    // Check if previous messages were about this topic
    const isPreviousAboutTopic = topic.keywords.some(keyword => 
      previousUserMessage.toLowerCase().includes(keyword.toLowerCase()) || 
      previousAiMessage.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check if current message mentions a value
    const containsValue = VALUE_PATTERNS.some(pattern => pattern.regex.test(trimmedInput));
    
    if (isPreviousAboutTopic && containsValue) {
      return `For the ${topic.context} we were discussing, my value is ${trimmedInput}`;
    }
  }
  
  // Default enhancement: connect to previous AI question
  if (previousAiMessage && previousAiMessage.includes('?')) {
    return `In response to your previous question, ${trimmedInput}`;
  }
  
  return trimmedInput;
};

/**
 * Extracts the last question from an AI message
 */
const extractLastQuestion = (aiMessage: string): string | null => {
  if (!aiMessage) return null;
  
  // Split by sentences and look for questions
  const sentences = aiMessage.split(/(?<=[.!?])\s+/);
  
  // Find the last question in the AI message
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (sentences[i].trim().endsWith('?')) {
      return sentences[i].trim();
    }
  }
  
  return null;
};

/**
 * Extract age information from a message
 */
export const extractAgeInfo = (message: string): number | null => {
  for (const pattern of AGE_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match && match[pattern.group]) {
      const age = parseInt(match[pattern.group]);
      if (age > 0 && age < 120) { // Reasonable age range
        return age;
      }
    }
  }
  return null;
};

/**
 * Extract retirement targets from messages
 */
export const extractRetirementTargets = (messages: any[]): {
  retirementAge?: number;
  retirementIncome?: number;
  currentAge?: number;
} => {
  const targets: {
    retirementAge?: number;
    retirementIncome?: number;
    currentAge?: number;
  } = {};
  
  for (const message of messages) {
    const content = message.content.toLowerCase();
    
    // Extract retirement age
    const retireAgePat = /retire\s+(?:at\s+)?(?:age\s+)?(\d+)/i;
    const retireAgeMatch = content.match(retireAgePat);
    if (retireAgeMatch && retireAgeMatch[1]) {
      targets.retirementAge = parseInt(retireAgeMatch[1]);
    }
    
    // Extract retirement income
    const incomePattern = /(\d+(?:\.\d+)?)\s*k\s*(?:chf|per\s+year)/i;
    const incomeMatch = content.match(incomePattern);
    if (incomeMatch && incomeMatch[1]) {
      targets.retirementIncome = parseFloat(incomeMatch[1]) * 1000;
    }
    
    // Extract current age
    const currentAge = extractAgeInfo(content);
    if (currentAge) {
      targets.currentAge = currentAge;
    }
  }
  
  return targets;
};

/**
 * Detect potential context for current message based on recent message history
 */
export const detectContextFromHistory = (messages: any[], currentInput: string): string => {
  if (messages.length < 2) return '';
  
  const recentMessages = messages.slice(-6);
  
  // Extract retirement goals from previous messages
  const retirementTargets = extractRetirementTargets(recentMessages);
  
  // Check if current message might be about age
  const currentAgeInfo = extractAgeInfo(currentInput);
  if (currentAgeInfo && retirementTargets.retirementAge) {
    return `I am ${currentAgeInfo} years old and planning to retire at age ${retirementTargets.retirementAge}${
      retirementTargets.retirementIncome ? ` with an annual income of CHF ${retirementTargets.retirementIncome}` : ''
    }.`;
  }
  
  // Extract potential topics from recent messages
  const mentionedTopics = new Set<string>();
  
  for (const message of recentMessages) {
    const content = message.content.toLowerCase();
    
    for (const topic of FINANCIAL_TOPICS) {
      for (const keyword of topic.keywords) {
        if (content.includes(keyword.toLowerCase())) {
          mentionedTopics.add(topic.context);
          break;
        }
      }
    }
  }
  
  if (mentionedTopics.size > 0) {
    return `Continuing our conversation about ${Array.from(mentionedTopics).join(' and ')}, in reference to: "${currentInput}"`;
  }
  
  return '';
};

