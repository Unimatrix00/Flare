import type { ButtonHTMLAttributes, ReactNode } from "react";

type GameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function GameButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: GameButtonProps) {
  const variants = {
    primary:
      "border-cyan-200/60 bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(78,199,255,0.35)] hover:bg-white",
    secondary:
      "border-orange-300/50 bg-orange-400/15 text-orange-100 hover:bg-orange-400/25",
    ghost:
      "border-white/15 bg-white/5 text-slate-100 hover:border-cyan-200/50 hover:bg-cyan-300/10",
    danger:
      "border-red-300/40 bg-red-500/15 text-red-100 hover:bg-red-500/25",
  };

  return (
    <button
      className={`rounded-full border px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] transition duration-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
