// types.ts
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  }
  
  export interface Component {
    id: string;
    type: string;
    label?: string;
    placeholder?: string;
    options?: { label: string; value: string }[];
    rows?: number;
    inputType?: string;
    multiline?: boolean;
    required?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    validation?: ValidationRule;
    children?: Component[];
    apiConfig?: ApiConfig;
    layout?: 'horizontal' | 'vertical';
    maxRating?: number;
    dateType?: string;
    action?: string;
  }
  
  export interface FormComponent extends Component {
    type: 'form';
    apiConfig?: ApiConfig;
  }
  
  export interface ChatSchema {
    message: string;
    components: Component[];
  }
  
  export interface ChatMessage {
    id: string;
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
    data?: Record<string, any>;
    schema?: ChatSchema;
  }
  
  export interface ApiConfig {
    url: string;
    method: 'GET' | 'POST';
  }
  
  export type FormErrors = Record<string, string>;
  