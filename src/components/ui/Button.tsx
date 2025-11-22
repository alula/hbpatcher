import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Removed font-bold, added font-normal
    const baseStyles =
      "inline-flex items-center justify-center font-normal transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-[2px]";

    const variants = {
      primary:
        "bg-switch-text-selected text-switch-bg hover:brightness-110 active:scale-95 switch-focus-ring",
      secondary:
        "bg-switch-selected-bg text-switch-text border border-switch-line-sep hover:border-switch-highlight-1 active:scale-95 switch-focus-ring",
      ghost: "bg-transparent text-switch-text hover:text-switch-text-selected",
      outline:
        "bg-transparent border border-switch-line-sep text-switch-text hover:border-switch-highlight-1",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-8 py-3 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
