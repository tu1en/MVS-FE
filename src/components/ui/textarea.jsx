
export const Textarea = ({ 
  className = '',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  rows = 3,
  ...props 
}) => {
  const baseClasses = 'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';
  
  return (
    <textarea
      className={`${baseClasses} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  );
};
