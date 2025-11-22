import * as React from "react";

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = "", onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    return (
      <label
        className={`relative inline-flex items-center cursor-pointer switch-focus-ring rounded-[2px] ${className}`}
      >
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          onChange={handleChange}
          {...props}
        />
        <div
          className="
          w-11 h-6 
          bg-switch-line-sep 
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-switch-highlight-2 
          rounded-full peer 
          peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
          after:transition-all 
          peer-checked:bg-switch-text-selected
        "
        ></div>
      </label>
    );
  },
);
Switch.displayName = "Switch";
