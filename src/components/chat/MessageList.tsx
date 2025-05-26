
import React from 'react';
import { Message } from '@/types/chat';
import { Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestamp } from '@/utils/chatUtils';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, messagesEndRef }) => {
  return (
    <ScrollArea className="h-[400px] p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex mb-4 ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'user'
                ? 'bg-findt-primary text-white'
                : 'bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-white/20 p-1">
                {message.sender === 'user' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
              </span>
              <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex mb-4 justify-start">
          <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 p-1">
                <Bot className="h-3 w-3" />
              </span>
              <span className="text-xs opacity-70">Thinking...</span>
            </div>
            <div className="flex gap-1 mt-2">
              <div className="h-2 w-2 rounded-full bg-findt-primary animate-pulse-soft"></div>
              <div className="h-2 w-2 rounded-full bg-findt-primary animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 rounded-full bg-findt-primary animate-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default MessageList;
