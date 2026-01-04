import { useState, useEffect } from 'react';

interface KeyBindingProps {
  label: string;
  icon?: React.ReactNode;
  defaultKey?: string;
}

export function KeyBinding({ label, icon, defaultKey = 'None' }: KeyBindingProps) {
  const [boundKey, setBoundKey] = useState(defaultKey);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      // Format the key name
      let keyName = e.key;
      
      // Special key names
      if (e.key === ' ') keyName = 'SPACE';
      else if (e.key === 'Control') keyName = e.location === 1 ? 'LCONTROL' : 'RCONTROL';
      else if (e.key === 'Shift') keyName = e.location === 1 ? 'LSHIFT' : 'RSHIFT';
      else if (e.key === 'Alt') keyName = e.location === 1 ? 'LALT' : 'RALT';
      else if (e.key === 'Meta') keyName = 'WIN';
      else if (e.key === 'Escape') keyName = 'ESC';
      else if (e.key === 'ArrowUp') keyName = '↑';
      else if (e.key === 'ArrowDown') keyName = '↓';
      else if (e.key === 'ArrowLeft') keyName = '←';
      else if (e.key === 'ArrowRight') keyName = '→';
      else if (e.key.startsWith('F') && e.key.length <= 3) keyName = e.key.toUpperCase();
      else keyName = e.key.toUpperCase();

      setBoundKey(keyName);
      setIsRecording(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const buttonNames = ['Left Click', 'Middle Click', 'Right Click'];
      setBoundKey(buttonNames[e.button] || `Mouse ${e.button}`);
      setIsRecording(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isRecording]);

  const handleReset = () => {
    setBoundKey('None');
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[180px]">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <label className="text-white/70 text-sm">{label}</label>
      </div>
      
      <button
        onClick={() => setIsRecording(true)}
        className={`flex-1 px-4 py-2 rounded-md transition-all text-sm ${
          isRecording
            ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 animate-pulse'
            : boundKey === 'None'
            ? 'bg-white/5 border border-white/20 text-white/50 hover:bg-white/10'
            : 'bg-white/10 border border-white/30 text-white/90 hover:bg-white/15'
        }`}
      >
        {isRecording ? '> Press any key <' : boundKey}
      </button>

      <button
        onClick={handleReset}
        className="px-4 py-2 bg-white/5 border border-white/20 rounded-md text-white/60 text-sm hover:bg-white/10 hover:text-white/80 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
