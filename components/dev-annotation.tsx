"use client";

import { useDevModeContext } from "@/components/dev-mode-provider";

type AnnotationKind = "server-component" | "client-component" | "server-action" | "route-handler";

interface DevAnnotationProps {
  kind: AnnotationKind;
  label: string;
  detail?: string;
  children: React.ReactNode;
}

const KIND_STYLES: Record<AnnotationKind, { outline: string; dot: string; text: string }> = {
  "server-component": {
    outline: "outline-cool",
    dot: "bg-cool",
    text: "text-cool",
  },
  "client-component": {
    outline: "outline-accent",
    dot: "bg-accent",
    text: "text-accent-text",
  },
  "server-action": {
    outline: "outline-ok",
    dot: "bg-ok",
    text: "text-ok",
  },
  "route-handler": {
    outline: "outline-accent-text",
    dot: "bg-accent-text",
    text: "text-accent-text",
  },
};

const KIND_LABELS: Record<AnnotationKind, string> = {
  "server-component": "Server Component",
  "client-component": "Client Component",
  "server-action": "Server Action",
  "route-handler": "Route Handler",
};

/**
 * Renders children untouched when dev mode is off — zero DOM/style cost, so
 * this is safe to sprinkle broadly across the public site. When on, wraps
 * children in a dashed outline (color keyed by `kind`, reusing the existing
 * palette tokens rather than a fifth color scale) plus a mono tooltip shown
 * on hover/focus.
 */
export function DevAnnotation({ kind, label, detail, children }: DevAnnotationProps) {
  const { enabled } = useDevModeContext();

  if (!enabled) return <>{children}</>;

  const styles = KIND_STYLES[kind];

  return (
    <div className={`group/dev relative h-full outline-dashed outline-2 outline-offset-2 ${styles.outline}`}>
      {children}
      <div className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-max max-w-xs flex-col gap-0.5 rounded-sm border border-line-strong bg-[#14100A] px-2.5 py-1.5 shadow-lg group-focus-within/dev:flex group-hover/dev:flex">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 flex-none rounded-full ${styles.dot}`} />
          <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${styles.text}`}>
            {KIND_LABELS[kind]}
          </span>
        </div>
        <p className="font-mono text-[10px] leading-snug text-[#D9E1E6]">{label}</p>
        {detail && <p className="font-mono text-[10px] leading-snug text-[#939FA9]">{detail}</p>}
      </div>
    </div>
  );
}
