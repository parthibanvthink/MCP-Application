export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  }
  
  export interface ApiConfig {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
  }
  
  export interface BaseComponent {
    id: string;
    type: string;
    label?: string;
    required?: boolean;
    validation?: ValidationRule;
  }
  
  export interface Option {
    value: string;
    label: string;
  }
  
  export interface InputComponent extends BaseComponent {
    type: "input";
    inputType: "text" | "email" | "tel";
    placeholder?: string;
  }
  
  export interface SelectComponent extends BaseComponent {
    type: "select";
    options: Option[];
  }
  
  export interface DateComponent extends BaseComponent {
    type: "date";
    dateType?: "date" | "datetime" | "time";
  }
  
  export interface SwitchComponent extends BaseComponent {
    type: "switch";
    defaultValue?: boolean;
  }
  
  export interface TextComponent extends BaseComponent {
    type: "text";
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
  }
  
  export interface MapComponent extends BaseComponent {
    type: "map";
    placeholder?: string;
  }
  
  export interface ButtonComponent extends BaseComponent {
    type: "button";
    variant?: "primary" | "secondary" | "danger";
    action?: "submit" | "reset";
  }
  
  export interface RatingComponent extends BaseComponent {
    type: "rating";
    maxRating: number;
  }
  
  export interface ContainerComponent extends BaseComponent {
    type: "container";
    children: Component[];
  }
  
  export interface FormComponent extends BaseComponent {
    type: "form";
    children: Component[];
    apiConfig?: ApiConfig;
  }
  
  export type Component =
    | InputComponent
    | TextComponent
    | SelectComponent
    | SwitchComponent
    | DateComponent
    | MapComponent
    | ButtonComponent
    | ContainerComponent
    | FormComponent
    | RatingComponent;
  
  export interface ChatSchema {
    id: string;
    message: string;
    components: Component[];
    schema?: any;
  }
  