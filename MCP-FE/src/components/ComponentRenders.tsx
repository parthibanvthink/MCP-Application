import React from 'react';
import InputField from './Input';
import SelectField from './Select';
import SwitchField from './Switch';
import ButtonField from './Button';
import MapField from './Map';
import RatingField from './Rating';

interface ComponentRendererProps {
  component: any;
  value: any;
  onChange: (id: string, value: any) => void;
  error?: string;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, value, onChange, error }) => {
  switch (component.type) {
    case 'input':
      return (
        <InputField
          id={component.id}
          label={component.label}
          type={component.inputType}
          value={value}
          onChange={onChange}
          placeholder={component.placeholder}
          error={error}
          disabled={component.disabled}
        />
      );

    case 'text':
      return (
        <InputField
          id={component.id}
          label={component.label}
          value={value}
          onChange={onChange}
          placeholder={component.placeholder}
          error={error}
          disabled={component.disabled}
        />
      );

    case 'select':
      return (
        <SelectField
          id={component.id}
          label={component.label}
          value={value}
          onChange={onChange}
          options={component.options || []}
          error={error}
          disabled={component.disabled}
        />
      );

    case 'switch':
      return (
        <SwitchField
          id={component.id}
          label={component.label}
          value={value}
          onChange={onChange}
          disabled={component.disabled}
        />
      );

    case 'date':
      return (
        <InputField
          id={component.id}
          label={component.label}
          type="date"
          value={value}
          onChange={onChange}
          error={error}
          disabled={component.disabled}
        />
      );

    case 'map':
      return (
        <MapField
          id={component.id}
          label={component.label}
          value={value}
          onChange={onChange}
          error={error}
        />
      );

    case 'rating':
      return (
        <RatingField
          id={component.id}
          label={component.label}
          value={value}
          onChange={onChange}
          maxRating={component.maxRating}
          disabled={component.disabled}
        />
      );

    case 'button':
      return (
        <ButtonField
          id={component.id}
          label={component.label}
          variant={component.variant}
          action={component.action}
          onClick={onChange}
          disabled={component.disabled}
        />
      );

    case 'form':
    case 'container':
      const layoutClass = component.layout === 'horizontal' ? 'flex flex-row space-x-4' :
                          component.layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' :
                          'flex flex-col space-y-4';

      return (
        <div className={component.type === 'form' ? 'space-y-4' : layoutClass}>
          {component.children?.map((child) => (
            <ComponentRenderer
              key={child.id}
              component={child}
              value={value?.[child.id]}
              onChange={(id, val) => {
                const newValue = { ...(value || {}), [id]: val };
                onChange(component.id, newValue);
              }}
              error={error}
            />
          ))}
        </div>
      );

    default:
      return <div>Unknown component type: {component.type}</div>;
  }
};

export default ComponentRenderer;
