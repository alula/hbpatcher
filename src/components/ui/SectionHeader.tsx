import React from "react";

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  children,
  className = "",
}: SectionHeaderProps) {
  return (
    <h3
      className={
        "text-lg text-switch-text font-normal leading-none mb-4 px-2 border-l-4 border-switch-line-sep " +
        className
      }
    >
      {children}
    </h3>
  );
}
