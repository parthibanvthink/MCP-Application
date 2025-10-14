import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Send,
} from "lucide-react";
import ComponentRenderer from "../components/ComponentRenders";
import { welcomeSchema } from "../schemas/welcomeSchema";
// import { ChatSchema } from "../types/schemaTypes";
import { appointmentSchema } from "../schemas/appointmentSchema";
import { feedbackSchema } from "../schemas/feedbackSchema";
import { ChatSchema } from "../types/schemaTypes";
import { ChatMessage } from "../types/validation";

// Types for messages
type Message = {
  id: string;
  type: "user" | "bot";
  content?: string;
  data?: any;
  timestamp: Date;
  schema?: {
    components: any[];
  };
};

interface ChatWindowProps {
  initialMessages?: Message[];
  onSubmitData?: (data: any) => void; // callback when user submits
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  initialMessages = [],
  onSubmitData,
}) => {
  const welcomeMessage = {
    id: "1",
    type: "bot",
    content: welcomeSchema.message,
    timestamp: new Date(),
    schema: welcomeSchema,
  };
  const [messages, setMessages] = useState<any>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSchema: any = null;

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleDataChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));

    // optional: validate immediately
    const field = lastBotMsg.schema.components[0].children.find(
      (f: any) => f.id === id
    );
    if (
      field?.validation?.minLength &&
      value.length < field.validation.minLength
    ) {
      setErrors((prev) => ({ ...prev, [id]: field.validation.message }));
    } else if (
      field?.validation?.pattern &&
      !new RegExp(field.validation.pattern).test(value)
    ) {
      setErrors((prev) => ({ ...prev, [id]: field.validation.message }));
    } else {
      setErrors((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // const hasValidData = () => {
  // Example: all required fields present and no errors
  // return (
  //   currentSchema &&
  //   currentSchema.components.every((c: any) => formData[c.id] !== undefined)
  // );
  // };

  const handleSubmit = async () => {

    if (!inputValue && Object.keys(formData).length === 0) {
      return;
    }
    try {
      const payload = Object.keys(formData).length > 0 ? {message: formData } : { message: inputValue };
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setInputValue("");
      const nextMessage: any = {
        id: Date.now().toString(),
        type: "bot",
        content: data.message,
        timestamp: new Date(),
        schema: data,
      };

      setMessages((prev) => [...prev, nextMessage]);
      currentSchema(data);
      setFormData({})
    } catch (err) {
      console.error(err);
    }
  };

  const formatUserData = (data: Record<string, unknown>): string => {
    return Object.entries(data)
      .map(([key, value]) => {
        const formattedKey = key
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        let formattedValue = value;

        if (typeof value === "boolean") {
          formattedValue = value ? "Yes" : "No";
        } else if (Array.isArray(value)) {
          formattedValue = value.join(", ");
        }

        return `${formattedKey}: ${formattedValue}`;
      })
      .join("\n");
  };

  const hasValidData = (schema: any, formData: Record<string, any>, errors: Record<string, string>) => {
    if (!schema) return false;
  
    // Find the form object
    const form = schema.components.find((c: any) => c.type === "form");
    if (!form) return false;
  
    return form.children.every((field: any) => {
      const value = formData[field.id];
  
      // Check required field
      if (field.required) {
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
      }
  
      // Check errors
      if (errors && errors[field.id]) return false;
  
      return true;
    });
  };  
  

  const lastBotMsg = [...messages]
    .reverse()
    .find((m: any) => m.type === "bot" && m.schema);

  const schema = lastBotMsg?.schema;
  const isFormValid =
    (schema && hasValidData(schema, formData, errors)) ||
    inputValue.trim().length !== 0;
  const isButtonEnabled = isFormValid;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <Bot className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Smart Assistant
            </h1>
            <p className="text-sm text-gray-500">Powered by Schema-driven UI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`w-screen w-full ${
                message.type === "user"
                  ? "bg-blue-600 text-white ml-12"
                  : "bg-white text-gray-900 mr-12"
              } rounded-lg shadow-sm border border-gray-200 p-4`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user" ? "bg-blue-500" : "bg-gray-100"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-gray-600"
                      }`}
                    >
                      {message.type === "user" ? "You" : "Assistant"}
                    </span>
                    <span
                      className={`text-xs ${
                        message.type === "user"
                          ? "text-blue-200"
                          : "text-gray-400"
                      } flex items-center`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={
                      message.type === "user" ? "text-white" : "text-gray-900"
                    }
                  >
                    {message.data ? (
                      <div className="space-y-2">
                        <p className="font-medium">Submitted Information:</p>
                        <pre
                          className={`text-sm ${
                            message.type === "user"
                              ? "text-blue-100"
                              : "text-gray-700"
                          } whitespace-pre-wrap`}
                        >
                          {formatUserData(message.data)}
                        </pre>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>

                  {message.type === "bot" && message.schema && (
                    <div className="mt-4">
                      {message.schema.components.map((component) => (
                        <ComponentRenderer
                          key={component.id}
                          component={component}
                          value={formData[component.id]}
                          onChange={handleDataChange}
                          error={errors[component.id]}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-screen w-full bg-white text-gray-900 mr-12 rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600">Processing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none border-blue-500`}
              />
              <div className="flex items-center text-sm text-gray-600 mb-2">
                {Object.keys(errors).length > 0 && (
                  <div className="flex items-center text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Please fix the errors above
                  </div>
                )}
                {/* {Object.keys(errors).length === 0 && hasValidData() && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Ready to submit
                  </div>
                )} */}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={false}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                 "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              
              }`}
              // className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              //   isButtonEnabled
              //     ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              //     : "bg-gray-300 text-gray-500"
              
              // }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2 text-center">
            Fill out the form above and click Send to submit your information
          </div>
        </div>
      }
    </div>
  );
};

export default ChatWindow;
