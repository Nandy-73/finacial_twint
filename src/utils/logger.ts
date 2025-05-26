
/**
 * Logger utility for consistent logging across the application
 */

// Enable this for more verbose logging in development
const VERBOSE_LOGGING = true;

export const logger = {
  info: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.info(`${timestamp} info: ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (VERBOSE_LOGGING) {
      const timestamp = new Date().toISOString();
      console.debug(`${timestamp} debug: ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.warn(`${timestamp} warn: ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} error: ${message}`, ...args);
  },
  
  contextLog: (context: string, message: string, ...args: any[]) => {
    if (VERBOSE_LOGGING) {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} [${context}]: ${message}`, ...args);
    }
  },
  
  conversation: (userId: string, messageType: 'user' | 'ai', content: string, metadata?: any) => {
    if (VERBOSE_LOGGING) {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} [conversation:${userId}] ${messageType}: ${content}`);
      if (metadata) {
        console.log(`${timestamp} [conversation:${userId}] metadata: `, metadata);
      }
    }
  }
};
