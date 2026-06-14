import React from 'react';

interface ExhibitInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  textarea?: boolean;
  era?: 'classical' | 'historical' | 'modern';
  dataTestId?: string;
  rows?: number;
}

export const ExhibitInput: React.FC<ExhibitInputProps> = ({
  textarea = false,
  era = 'classical',
  dataTestId,
  className = '',
  ...props
}) => {
  // Focus ring color based on era
  const focusRingColor = 
    era === 'classical' 
      ? 'focus:ring-amber-500' 
      : era === 'historical' 
      ? 'focus:ring-red-500' 
      : 'focus:ring-teal-500';

  // Shared styles
  // Higher contrast: solid darker bg with bright white text for readability
  const baseStyles = `w-full px-4 py-2 bg-slate-950 border border-slate-500 rounded-lg text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 ${focusRingColor} focus:border-transparent transition-all`;

  if (textarea) {
    return (
      <textarea
        data-testid={dataTestId}
        className={`${baseStyles} ${className}`}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <input
      data-testid={dataTestId}
      className={`${baseStyles} ${className}`}
      {...props}
    />
  );
};
