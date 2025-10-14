import React from 'react';
import { User, Bot, Clock } from 'lucide-react';
import { ChatMessage } from '../types/validation';

export const MessageCard: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.type === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl w-full rounded-lg shadow-sm border p-4 ${isUser ? 'bg-blue-600 text-white ml-12' : 'bg-white text-gray-900 mr-12'}`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-100'}`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-600" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isUser ? 'text-blue-100' : 'text-gray-600'}`}>{isUser ? 'You' : 'Assistant'}</span>
              <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" />{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className={isUser ? 'text-white' : 'text-gray-900'}>{message.data ? <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(message.data, null, 2)}</pre> : message.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
