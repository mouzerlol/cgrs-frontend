import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 'w-5 h-5',
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const Avatar = ({ src, alt, size = 'sm', className }: AvatarProps) => {
  return (
    <div className={cn("relative shrink-0", className)}>
      <img 
        src={src || 'https://via.placeholder.com/150'} 
        alt={alt || 'User'} 
        className={cn(
          sizeMap[size],
          "rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-sage/10"
        )} 
      />
    </div>
  );
};
