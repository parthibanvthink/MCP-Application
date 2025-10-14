import { Component, FormErrors } from '../types/validation';

export const validateComponent = (component: Component, value: any): string | null => {
  if (!component.validation) return null;
  const { required, minLength, maxLength, pattern, min, max, message } = component.validation;

  if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return message || `${component.label || 'This field'} is required`;
  }

  if (!value || (typeof value === 'string' && value.trim() === '')) return null;

  if (typeof value === 'string') {
    if (minLength && value.length < minLength) return message || `Minimum ${minLength} characters required`;
    if (maxLength && value.length > maxLength) return message || `Maximum ${maxLength} characters allowed`;
    if (pattern && !new RegExp(pattern).test(value)) return message || 'Invalid format';
  }

  if (typeof value === 'number') {
    if (min !== undefined && value < min) return message || `Minimum value is ${min}`;
    if (max !== undefined && value > max) return message || `Maximum value is ${max}`;
  }

  return null;
};

export const validateForm = (components: Component[], data: Record<string, any>): FormErrors => {
  const errors: FormErrors = {};
  const validateRecursive = (comp: Component) => {
    const error = validateComponent(comp, data[comp.id]);
    if (error) errors[comp.id] = error;
    if (comp.children?.length) comp.children.forEach(validateRecursive);
  };
  components.forEach(validateRecursive);
  return errors;
};
