import React from 'react';

interface ButtonProps {
  id?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  action?: 'submit' | string;
  disabled?: boolean;
  onClick?: (id: string, action?: string) => void;
}

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const Button: React.FC<ButtonProps> = ({
  id = '',
  label,
  variant = 'primary',
  action = 'button',
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type={action === 'submit' ? 'submit' : 'button'}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonVariants[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={disabled}
      onClick={() => onClick && onClick(id, action)}
    >
      {label}
    </button>
  );
};

export default Button;
