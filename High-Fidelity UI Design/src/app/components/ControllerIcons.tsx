// Controller Button Icon Components
export function ButtonA() {
  return (
    <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500/60 flex items-center justify-center">
      <span className="text-green-400 text-xs font-bold">A</span>
    </div>
  );
}

export function ButtonB() {
  return (
    <div className="w-6 h-6 rounded-full bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center">
      <span className="text-red-400 text-xs font-bold">B</span>
    </div>
  );
}

export function ButtonX() {
  return (
    <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500/60 flex items-center justify-center">
      <span className="text-blue-400 text-xs font-bold">X</span>
    </div>
  );
}

export function ButtonY() {
  return (
    <div className="w-6 h-6 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center">
      <span className="text-yellow-400 text-xs font-bold">Y</span>
    </div>
  );
}

export function LeftBumper() {
  return (
    <div className="w-7 h-5 rounded bg-white/10 border border-white/40 flex items-center justify-center">
      <span className="text-white/80 text-[10px] font-bold">LB</span>
    </div>
  );
}

export function RightBumper() {
  return (
    <div className="w-7 h-5 rounded bg-white/10 border border-white/40 flex items-center justify-center">
      <span className="text-white/80 text-[10px] font-bold">RB</span>
    </div>
  );
}

export function LeftTrigger() {
  return (
    <div className="w-7 h-5 rounded-t-lg bg-white/10 border border-white/40 flex items-center justify-center">
      <span className="text-white/80 text-[10px] font-bold">LT</span>
    </div>
  );
}

export function RightTrigger() {
  return (
    <div className="w-7 h-5 rounded-t-lg bg-white/10 border border-white/40 flex items-center justify-center">
      <span className="text-white/80 text-[10px] font-bold">RT</span>
    </div>
  );
}

export function LeftStick() {
  return (
    <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center relative">
      <span className="text-white/80 text-[9px] font-bold">L3</span>
    </div>
  );
}

export function RightStick() {
  return (
    <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center relative">
      <span className="text-white/80 text-[9px] font-bold">R3</span>
    </div>
  );
}

export function DPadUp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 8L12 16M8 12L16 12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <path d="M12 8L12 10" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

export function DPadDown() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 8L12 16M8 12L16 12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <path d="M12 14L12 16" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

export function DPadLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 8L12 16M8 12L16 12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <path d="M8 12L10 12" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

export function DPadRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 8L12 16M8 12L16 12" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      <path d="M14 12L16 12" stroke="#06b6d4" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BackButton() {
  return (
    <div className="w-6 h-6 rounded-md bg-white/10 border border-white/40 flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="6" width="5" height="4" rx="1" fill="white" opacity="0.6"/>
        <rect x="9" y="6" width="5" height="4" rx="1" fill="white" opacity="0.6"/>
      </svg>
    </div>
  );
}

export function StartButton() {
  return (
    <div className="w-6 h-6 rounded-md bg-white/10 border border-white/40 flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6L4 10M8 6L8 10M12 6L12 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    </div>
  );
}