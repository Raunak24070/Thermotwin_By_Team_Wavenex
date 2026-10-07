import React from 'react';
import { 
  FlaskConical, 
  Cpu, 
  Thermometer, 
  ClipboardList, 
  Calculator, 
  FileText, 
  Users, 
  MonitorPlay, 
  BookOpen, 
  Settings,
  HelpCircle
} from 'lucide-react';

export type ActiveTool = 
  | 'LAB' 
  | 'SIMULATION' 
  | 'SENSORS' 
  | 'OBSERVATIONS' 
  | 'FOURIER' 
  | 'REPORT' 
  | 'LIVE_MONITOR' 
  | 'CLASSROOM' 
  | 'GUIDE' 
  | 'SETTINGS';

interface IconRailProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
}

interface RailItem {
  id: ActiveTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  category: 'primary' | 'secondary' | 'system';
}

const RAIL_ITEMS: RailItem[] = [
  { id: 'LAB', label: 'Laboratory Twin', icon: FlaskConical, category: 'primary' },
  { id: 'SIMULATION', label: 'FDTD Solver', icon: Cpu, category: 'primary' },
  { id: 'SENSORS', label: 'Thermocouple Telemetry', icon: Thermometer, category: 'primary' },
  { id: 'OBSERVATIONS', label: 'Observation Notebook', icon: ClipboardList, category: 'primary' },
  { id: 'FOURIER', label: 'Fourier Workbench', icon: Calculator, category: 'primary' },
  { id: 'REPORT', label: 'Academic Report', icon: FileText, category: 'primary' },
  { id: 'LIVE_MONITOR', label: 'Faculty Live Monitor', icon: MonitorPlay, badge: 'LIVE', category: 'secondary' },
  { id: 'CLASSROOM', label: 'Virtual Classrooms', icon: Users, category: 'secondary' },
  { id: 'GUIDE', label: '10-Step Protocol', icon: BookOpen, category: 'secondary' },
  { id: 'SETTINGS', label: 'Settings', icon: Settings, category: 'system' }
];

export const IconRail: React.FC<IconRailProps> = ({ activeTool, onSelectTool }) => {
  return (
    <aside className="w-16 bg-[#0D0F0E] border-r border-[#252825] flex flex-col items-center py-3 select-none shrink-0 z-20 justify-between">
      
      {/* Top Group: Core Experiment Tools */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {RAIL_ITEMS.filter(item => item.category === 'primary').map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => onSelectTool(item.id)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm'
                    : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#171918]'
                }`}
                aria-label={item.label}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <span className="absolute -left-2.5 top-2 bottom-2 w-1 bg-[#39FF14] rounded-r-full glow-green-sm" />
                )}
                <Icon className="w-5 h-5" />
              </button>

              {/* Hover Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#171918] border border-[#303330] text-[#F5F5F5] text-[11px] font-mono px-2.5 py-1 rounded-md shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Divider */}
      <div className="w-8 h-px bg-[#252825] my-2" />

      {/* Middle Group: Supervision, Classrooms, SOP */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {RAIL_ITEMS.filter(item => item.category === 'secondary').map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => onSelectTool(item.id)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm'
                    : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#171918]'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <span className="absolute -left-2.5 top-2 bottom-2 w-1 bg-[#39FF14] rounded-r-full glow-green-sm" />
                )}
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#171918] border border-[#303330] text-[#F5F5F5] text-[11px] font-mono px-2.5 py-1 rounded-md shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 px-1 py-0.2 rounded bg-[#EF4444]/20 text-[#EF4444] text-[9px]">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Group: Settings */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-[#252825]">
        {RAIL_ITEMS.filter(item => item.category === 'system').map((item) => {
          const Icon = item.icon;
          const isActive = activeTool === item.id;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => onSelectTool(item.id)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm'
                    : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#171918]'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <span className="absolute -left-2.5 top-2 bottom-2 w-1 bg-[#39FF14] rounded-r-full glow-green-sm" />
                )}
                <Icon className="w-5 h-5" />
              </button>

              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#171918] border border-[#303330] text-[#F5F5F5] text-[11px] font-mono px-2.5 py-1 rounded-md shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

    </aside>
  );
};
