import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MappingDropdownProps {
  label: string;
  options: string[];
  defaultValue?: string;
  icon?: React.ReactNode;
}

export function MappingDropdown({ label, options, defaultValue = 'None', icon }: MappingDropdownProps) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/60 text-sm tracking-wide flex items-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg text-white/90 text-left flex items-center justify-between hover:bg-white/8 hover:border-white/20 transition-all"
        >
          <span>{value}</span>
          <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#202020]/95 backdrop-blur-2xl border border-white/15 rounded-lg shadow-2xl overflow-hidden z-50">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setValue(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-white/90 text-left hover:bg-white/10 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}