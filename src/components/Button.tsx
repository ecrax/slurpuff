export const FilledButton: React.FC<{
  children?: React.ReactNode;
  onClick: React.MouseEventHandler;
  icon: React.ReactNode;
  disabled?: boolean;
}> = ({ children, onClick, icon, disabled }) => {
  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="w-5 h-5 mr-2 -ml-1"> {icon}</div>
      {children}
    </button>
  );
};
export const OutlineButton: React.FC<{
  children?: React.ReactNode;
  onClick: React.MouseEventHandler;
  icon: React.ReactNode;

  disabled?: boolean;
}> = ({ children, onClick, icon, disabled }) => {
  return (
    <button
      type="button"
      className="mt-2 btn btn-outline"
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
  );
};
