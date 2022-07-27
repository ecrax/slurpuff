import React from "react";

export const FilledButton: React.FC<{
  children?: React.ReactNode;
  onClick: React.MouseEventHandler;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, icon, className, disabled }) => {
  return (
    <div className={className}>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        onClick={onClick}
        disabled={disabled}
      >
        <div className="w-5 h-5 mr-2 -ml-1"> {icon}</div>
        {children}
      </button>
    </div>
  );
};
export const OutlineButton: React.FC<{
  children?: React.ReactNode;
  onClick: React.MouseEventHandler;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, icon, className, disabled }) => {
  return (
    <div className={className}>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm max-w-min hover:bg-gray-50"
        onClick={onClick}
        disabled={disabled}
      >
        <div
          className={`w-5 h-5 ${children ? "mr-2" : "-mr-1"} -ml-1`}
          aria-hidden="true"
        >
          {icon}
        </div>

        {children}
      </button>
    </div>
  );
};
