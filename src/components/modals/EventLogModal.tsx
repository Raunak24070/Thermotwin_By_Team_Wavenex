import React from 'react';
import { X, Bell, Clock, Activity, Trash2 } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface EventLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventLogModal: React.FC<EventLogModalProps> = ({ isOpen, onClose }) => {
  const { eventLog } = usePhysicsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wide">
              EXPERIMENT AUDIT LOG &bull; TELEMETRY EVENTS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-[#0D0F0E]">
          {eventLog.length === 0 ? (
            <div className="py-8 text-center text-[#7C827C]">
              No events recorded yet.
            </div>
          ) : (
            eventLog.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-[#39FF14]">
                    {evt.eventType}
                  </span>
                  <span className="text-[9px] text-[#7C827C]">{evt.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#B5BBB5] leading-relaxed">
                  {evt.details}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252825] bg-[#111312] flex justify-between items-center text-[#7C827C]">
          <span>{eventLog.length} System audit events logged</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
