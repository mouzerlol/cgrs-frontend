import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export default function FilterDropdown({ label, options, selectedValues, onChange }: FilterDropdownProps) {
  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const isActive = selectedValues.length > 0;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
          isActive 
            ? "bg-terracotta/20 text-terracotta border-terracotta/30" 
            : "bg-bone/10 text-bone/70 border-bone/20 hover:bg-bone/20 hover:text-bone"
        )}
      >
        {label}
        {isActive && <span className="ml-0.5 bg-terracotta text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]">{selectedValues.length}</span>}
        <ChevronDown className="w-3.5 h-3.5 opacity-70" strokeWidth={1.5} />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => toggleValue(option.value)}
                      className={cn(
                        active ? 'bg-sage-light/30' : '',
                        'group flex w-full items-center px-4 py-2 text-sm text-forest'
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors",
                        isSelected ? "bg-terracotta border-terracotta" : "border-sage/40"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={1.5} />}
                      </div>
                      {option.label}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
