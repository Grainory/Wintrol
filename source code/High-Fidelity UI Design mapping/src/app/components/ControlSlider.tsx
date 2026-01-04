import { useState } from 'react';

interface ControlSliderProps {
  label: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  step?: number;
}

export function ControlSlider({ 
  label, 
  min = 0, 
  max = 100, 
  defaultValue = 50,
  step = 1 
}: ControlSliderProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      setValue(newValue);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <label className="text-white/70 min-w-[140px]">
        {label}
      </label>
      <div className="flex-1 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="w-full h-1 rounded-full appearance-none cursor-pointer slider-track"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.15) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.15) 100%)`
            }}
          />
        </div>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            className="w-20 px-3 py-1.5 bg-white/5 backdrop-blur-xl border-b border-white/20 text-white/90 text-center rounded-md focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
