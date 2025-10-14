import React from 'react';
import ComponentRenderer from './ComponentRenders';

interface FormProps {
  id?: string;
  childrenComponents: any[];
  value?: Record<string, any>;
  onChange: (id: string, value: any) => void;
  error?: string;
}

const Form: React.FC<FormProps> = ({
  id = '',
  childrenComponents,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      {childrenComponents.map((child) => (
        <ComponentRenderer
          key={child.id}
          component={child}
          value={value?.[child.id]}
          onChange={(childId, val) => {
            const newValue = { ...(value || {}), [childId]: val };
            onChange(id, newValue);
          }}
          error={error}
        />
      ))}
    </div>
  );
};

export default Form;
