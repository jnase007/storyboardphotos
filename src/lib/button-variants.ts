import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gold" | "royal";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
} = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shrink-0";

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    gold: "bg-royal-gold text-royal-blue font-semibold hover:bg-[#D4B480] shadow-lg shadow-royal-gold/25 hover:shadow-royal-gold/40 transition-shadow",
    royal:
      "bg-royal-blue text-royal-cream hover:bg-royal-purple border border-royal-gold/30",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-12 min-h-12 px-6 sm:px-8 text-base",
    icon: "h-10 w-10",
  };

  return cn(base, variants[variant], sizes[size], className);
}
