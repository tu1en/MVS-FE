
const Progress = ({ value, className = '', ...props }) => {
  const percentage = Math.min(100, Math.max(0, value || 0));
  
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}
      {...props}
    >
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { Progress };

