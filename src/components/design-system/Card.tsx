import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, className, hoverable = false }: CardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-sage/10 shadow-sm transition-all duration-200",
      hoverable && "hover:border-sage/30 hover:shadow-md",
      className
    )}>
      {children}
    </div>
  );
};
