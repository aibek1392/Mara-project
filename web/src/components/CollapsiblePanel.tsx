import { useState, type ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";

interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  variant?: "section" | "nested";
}

export function CollapsiblePanel({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className = "",
  variant = "section",
}: CollapsiblePanelProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`collapsible-panel collapsible-${variant} ${open ? "collapsible-open" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="collapsible-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={open ? t("common.hideSection") : t("common.showSection")}
      >
        <span className="collapsible-trigger-text">
          <span className="collapsible-title">{title}</span>
          {subtitle && <span className="collapsible-sub">{subtitle}</span>}
        </span>
        <span className="collapsible-chevron" aria-hidden="true" />
      </button>
      <div className="collapsible-content" hidden={!open}>
        <div className="collapsible-content-inner">{children}</div>
      </div>
    </div>
  );
}
