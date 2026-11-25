import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-primary-dark disabled:hover:bg-primary",
  secondary:
    "border border-forest-primary/40 bg-surface text-ink hover:border-forest-primary hover:bg-surface-muted disabled:hover:bg-surface",
  outline:
    "border border-border bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-muted hover:text-ink disabled:hover:border-border",
  ghost: "text-ink-soft hover:bg-surface-muted hover:text-ink",
  danger:
    "border border-danger/50 bg-surface text-danger hover:bg-danger-soft disabled:hover:bg-surface",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-md px-2.5 text-xs",
  md: "h-9 gap-2 rounded-md px-3.5 text-[13.5px]",
  lg: "h-11 gap-2 rounded-lg px-5 text-sm",
  icon: "size-9 rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const trailingIcon =
    iconPosition === "right" && icon !== undefined ? (
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
    ) : null;

  const leadingIcon =
    iconPosition === "left" && icon !== undefined ? (
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
    ) : null;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        leadingIcon
      )}
      {children}
      {trailingIcon}
    </button>
  );
}
