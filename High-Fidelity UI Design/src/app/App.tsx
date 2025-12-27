import { useState } from 'react';
import { WindowControls } from './components/WindowControls';
import { ControlSlider } from './components/ControlSlider';
import { KeyBinding } from './components/KeyBinding';
import { SectionHeader } from './components/SectionHeader';
import { 
  ButtonA, 
  ButtonB, 
  ButtonX, 
  ButtonY,
  LeftBumper,
  RightBumper,
  LeftTrigger,
  RightTrigger,
  LeftStick,
  RightStick,
  DPadUp,
  DPadDown,
  DPadLeft,
  DPadRight,
  BackButton,
  StartButton
} from './components/ControllerIcons';

export default function App() {
  const [isRunning, setIsRunning] = useState(true);

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Frameless Window Container with Mica Alt Effect */}
      <div 
        className="w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col"
        style={{
          backgroundColor: 'rgba(26, 26, 26, 0.85)',
          backdropFilter: 'blur(80px)',
        }}
      >
        {/* Header Section */}
        <div 
          className="px-6 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0"
          style={{
            WebkitAppRegion: 'drag',
          } as React.CSSProperties}
        >
          {/* Logo */}
          <div className="text-white text-3xl font-black tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            WINTROL
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'} ${isRunning ? 'shadow-[0_0_12px_rgba(34,197,94,0.8)]' : ''}`}
              />
              <span className="text-white/80 text-sm tracking-wide">
                {isRunning ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-1.5 rounded-full transition-all ${
                isRunning 
                  ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                  : 'bg-green-500/20 border border-green-500/40 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
              }`}
            >
              {isRunning ? 'STOP' : 'START'}
            </button>

            {/* Window Controls */}
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              <WindowControls />
            </div>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-8 space-y-8">
            {/* Main Controls Section */}
            <div className="space-y-6">
              <ControlSlider label="SENSITIVITY X" min={0} max={100} defaultValue={50} />
              <ControlSlider label="SENSITIVITY Y" min={0} max={100} defaultValue={50} />
              <ControlSlider label="SCROLL SPEED" min={0} max={100} defaultValue={50} />
              <ControlSlider label="DEADZONE" min={0} max={10000} defaultValue={5000} step={100} />
            </div>

            {/* Controller Mapping Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-white/80 tracking-widest">
                  CONTROLLER MAPPING
                </h2>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>

              {/* Face Buttons Section */}
              <SectionHeader title="BUTTONS" />
              <div className="grid grid-cols-[1fr_1px_1fr] gap-x-8 gap-y-4">
                <KeyBinding label="BUTTON A" icon={<ButtonA />} defaultKey="Left Click" />
                <div className="row-span-2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="BUTTON B" icon={<ButtonB />} defaultKey="Right Click" />
                <KeyBinding label="BUTTON X" icon={<ButtonX />} defaultKey="Middle Click" />
                <div className="row-span-2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="BUTTON Y" icon={<ButtonY />} />
              </div>

              {/* Bumpers Section */}
              <SectionHeader title="BUMPERS" />
              <div className="grid grid-cols-[1fr_1px_1fr] gap-x-8 gap-y-4">
                <KeyBinding label="LEFT BUMPER" icon={<LeftBumper />} />
                <div className="w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="RIGHT BUMPER" icon={<RightBumper />} />
              </div>

              {/* Triggers Section */}
              <SectionHeader title="TRIGGERS" />
              <div className="grid grid-cols-[1fr_1px_1fr] gap-x-8 gap-y-4">
                <KeyBinding label="LEFT TRIGGER" icon={<LeftTrigger />} />
                <div className="w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="RIGHT TRIGGER" icon={<RightTrigger />} />
              </div>

              {/* Stick Clicks Section */}
              <SectionHeader title="STICK CLICKS" />
              <div className="grid grid-cols-[1fr_1px_1fr] gap-x-8 gap-y-4">
                <KeyBinding label="LEFT STICK CLICK" icon={<LeftStick />} />
                <div className="w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="RIGHT STICK CLICK" icon={<RightStick />} />
              </div>

              {/* System Buttons Section */}
              <SectionHeader title="SYSTEM" />
              <div className="grid grid-cols-[1fr_1px_1fr] gap-x-8 gap-y-4">
                <KeyBinding label="BACK/SELECT" icon={<BackButton />} />
                <div className="w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="START" icon={<StartButton />} />
              </div>

              {/* D-Pad Section */}
              <SectionHeader title="D-PAD" />
              <div className="grid grid-cols-[1fr_1px_1fr] gap-x-8 gap-y-4">
                <KeyBinding label="D-PAD UP" icon={<DPadUp />} />
                <div className="row-span-2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="D-PAD DOWN" icon={<DPadDown />} />
                <KeyBinding label="D-PAD LEFT" icon={<DPadLeft />} />
                <div className="row-span-2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <KeyBinding label="D-PAD RIGHT" icon={<DPadRight />} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}