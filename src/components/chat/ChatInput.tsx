
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isTyping: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  isTyping,
  onInputChange,
  onKeyPress,
  onSendMessage
}) => {
  return (
    <div className="flex w-full items-center space-x-2">
      <Input
        placeholder="Ask about your finances..."
        value={input}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
        className="flex-1"
        disabled={isTyping}
      />
      <Button 
        onClick={onSendMessage} 
        disabled={input.trim() === '' || isTyping}
        className="bg-findt-primary"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
};

export default ChatInput;
