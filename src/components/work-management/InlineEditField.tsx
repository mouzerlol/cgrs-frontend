import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'textarea' | 'select';
  options?: { label: string; value: string }[];
  className?: string;
  textClassName?: string;
  placeholder?: string;
}

export default function InlineEditField({
  value,
  onSave,
  type = 'text',
  options = [],
  className,
  textClassName,
  placeholder = 'Click to edit...'
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    const displayValue = type === 'select' 
      ? options.find(o => o.value === value)?.label || value
      : value;

    return (
      <div 
        className={cn("group flex items-start gap-2 cursor-pointer p-1 -ml-1 rounded hover:bg-sage-light/30 transition-colors", className)}
        onClick={() => setIsEditing(true)}
      >
        <div className={cn("flex-1", textClassName, !value && "text-forest/40 italic")}>
          {displayValue || placeholder}
        </div>
        <Pencil className="w-3.5 h-3.5 text-forest/30 opacity-0 group-hover:opacity-100 mt-1 shrink-0 transition-opacity" strokeWidth={1.5} />
      </div>
    );
  }

  const commonClasses = "w-full bg-white border border-sage/30 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta text-forest font-body text-sm transition-all";

  if (type === 'textarea') {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(commonClasses, "min-h-[100px] resize-y", className)}
      />
    );
  }

  if (type === 'select') {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={editValue}
        onChange={e => {
          setEditValue(e.target.value);
          // Wait for state to update, then save and close
          setTimeout(() => {
            onSave(e.target.value);
            setIsEditing(false);
          }, 0);
        }}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(commonClasses, className)}
      >
        <option value="" disabled>Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={editValue}
      onChange={e => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={cn(commonClasses, className)}
    />
  );
}
