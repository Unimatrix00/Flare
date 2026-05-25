import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
  intensity?: "soft" | "strong";
};

export function Panel({ children, className = "", intensity = "soft" }: PanelProps) {
  const glow =
    intensity === "strong"
      ? "border-cyan-300/35 bg-slate-950/80 shadow-[0_0_50px_rgba(78,199,255,0.12)]"
      : "border-white/10 bg-slate-950/60 shadow-[0_24px_80px_rgba(0,0,0,0.3)]";

  return (
    <section
      className={`rounded-3xl border ${glow} backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}
