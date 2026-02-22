import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'forest' | 'terracotta';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    default: "bg-sage/10 text-forest border-sage/20",
    outline: "bg-transparent border-sage/20 text-forest/60",
    forest: "bg-forest/5 text-forest border-forest/10",
    terracotta: "bg-terracotta/5 text-terracotta border-terracotta/10",
  };

  return (
    <div className={cn(
      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
};
