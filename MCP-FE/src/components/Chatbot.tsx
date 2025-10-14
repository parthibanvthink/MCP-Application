import React, { useState, useEffect, useRef } from 'react';
import  ComponentRenderer  from './ComponentRenders';
import { FormInputArea } from './FormInputArea';
import { MessageCard } from './MessageCard';
import { simulateApiCall } from '../utils/api';
import { validateForm } from '../utils/validation';
import { FormErrors } from '../types/validation';
import { welcomeSchema } from '../schemas/welcomeSchema';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: '1', type: 'bot', content: welcomeSchema.message, timestamp: new Date(), schema: welcomeSchema }]);
    setCurrentSchema(welcomeSchema);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleDataChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => { const newErr = { ...prev }; delete newErr[id]; return newErr; });
  };

  const handleSubmit = async () => {
    if (!currentSchema) return;
    setIsLoading(true);

    const validationErrors = validateForm(currentSchema.components, formData);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); setIsLoading(false); return; }

    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: 'Form submitted', timestamp: new Date(), data: formData }]);

    const formComponent = currentSchema.components.find(c => c.type === 'form' && c.apiConfig);
    try { if (formComponent?.apiConfig) await simulateApiCall(formComponent.apiConfig, formData); }
    catch (err) { setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: `❌ Error: ${(err as Error).message}`, timestamp: new Date() }]); }

    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: '✅ Submission complete', timestamp: new Date() }]);
    setFormData({});
    setCurrentSchema(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <span className="text-lg font-semibold text-gray-900">Smart Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => <MessageCard key={msg.id} message={msg} />)}
        {currentSchema?.components.map(cmp => <ComponentRenderer key={cmp.id} component={cmp} value={formData[cmp.id]} onChange={handleDataChange} error={errors[cmp.id]} />)}
        <div ref={messagesEndRef} />
      </div>

      {currentSchema && <FormInputArea schema={currentSchema} formData={formData} errors={errors} onChange={handleDataChange} onSubmit={handleSubmit} isLoading={isLoading} />}
    </div>
  );
};

export default Chatbot;
