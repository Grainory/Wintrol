import { Minus, X } from 'lucide-react';

export function WindowControls() {
  return (
    <div className="flex items-center gap-1">
      <button
        className="w-11 h-9 flex items-center justify-center hover:bg-white/10 transition-colors"
        aria-label="Minimize"
      >
        <Minus className="w-4 h-4 text-white/90" />
      </button>
      <button
        className="w-11 h-9 flex items-center justify-center hover:bg-red-500/90 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-white/90" />
      </button>
    </div>
  );
}
