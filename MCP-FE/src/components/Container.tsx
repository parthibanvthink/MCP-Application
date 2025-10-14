import React from 'react';
import ComponentRenderer from './ComponentRenders';

interface ContainerProps {
  id?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  childrenComponents: any[];
  value?: Record<string, any>;
  onChange: (id: string, value: any) => void;
  error?: string;
}

const layoutClasses = {
  vertical: 'flex flex-col space-y-4',
  horizontal: 'flex flex-row space-x-4',
  grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
};

const Container: React.FC<ContainerProps> = ({
  id = '',
  layout = 'vertical',
  childrenComponents,
  value,
  onChange,
  error,
}) => {
  return (
    <div className={`mb-4 ${layoutClasses[layout]}`}>
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

export default Container;
