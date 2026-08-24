import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  center?: boolean;
}

export function SectionHeading({ eyebrow, title, subtitle, action, center }: SectionHeadingProps) {
  const className = `section-head${center ? " section-head--center" : action ? " section-head--split" : ""}`;
  return (
    <div className={className}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="h2 section-head__title">{title}</h2>
        {subtitle && <p className="section-head__sub">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
