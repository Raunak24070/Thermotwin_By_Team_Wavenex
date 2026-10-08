import React, { useEffect } from 'react';
import { 
  X, 
  Radio, 
  Eye, 
  Flame, 
  Droplets, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  MonitorPlay,
  UserCheck
} from 'lucide-react';
import { useRealtimeMonitorStore, StudentLiveTelemetry } from '@/store/useRealtimeMonitorStore';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface LiveLabMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudentToSupervise?: (student: StudentLiveTelemetry) => void;
}

export const LiveLabMonitorModal: React.FC<LiveLabMonitorModalProps> = ({
  isOpen,
  onClose,
  onSelectStudentToSupervise
}) => {
  const { liveStudents, tickLiveSimulation } = useRealtimeMonitorStore();
  const { setMaterial, setVoltage, setWaterFlow, startExperiment } = usePhysicsStore();

  // Tick background student simulation while monitor is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      tickLiveSimulation();
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, tickLiveSimulation]);

  if (!isOpen) return null;

  const studentList = Object.values(liveStudents);

  const handleInspectStudent = (student: StudentLiveTelemetry) => {
    // Mirror student's physics parameters into local apparatus
    setMaterial(student.materialId);
    setVoltage(student.voltage);
    setWaterFlow(student.waterFlowLmin);
    startExperiment();

    if (onSelectStudentToSupervise) {
      onSelectStudentToSupervise(student);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center">
              <Radio className="w-4 h-4 text-[#EF4444] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wide">
                  FACULTY LIVE LAB MONITOR
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
                  {studentList.length} ACTIVE STATIONS
                </span>
              </div>
              <span className="text-[10px] text-[#7C827C]">
                Real-time thermal digital twins &bull; Click any student to mirror their experiment in the 3D twin
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Student Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#0D0F0E]">
          {studentList.map((std) => {
            const isSteady = std.steadyStateStatus === 'STEADY_STATE';
            const isApproaching = std.steadyStateStatus === 'APPROACHING_STEADY_STATE';

            return (
              <div
                key={std.studentId}
                className="bg-[#171918] border border-[#252825] hover:border-[#39FF14]/50 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all group shadow-lg"
              >
                {/* Student Info Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={std.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={std.studentName}
                      className="w-9 h-9 rounded-full border border-[#303330] object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-xs text-[#F5F5F5] group-hover:text-[#39FF14] transition-colors">
                        {std.studentName}
                      </h3>
                      <span className="text-[10px] text-[#7C827C] block">
                        {std.sessionId}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#102713] text-[#39FF14] border border-[#163D19]">
                    {std.materialName.split(' ')[0]}
                  </span>
                </div>

                {/* State Badge */}
                <div className={`p-2 rounded-xl border flex items-center justify-between text-[10px] font-bold ${
                  isSteady
                    ? 'bg-[#102713] border-[#163D19] text-[#39FF14]'
                    : isApproaching
                    ? 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
                    : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                }`}>
                  <span className="flex items-center gap-1.5">
                    {isSteady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-spin" />}
                    <span>{std.steadyStateStatus}</span>
                  </span>
                  <span className="text-[#7C827C] font-normal">{std.lastUpdatedTime}</span>
                </div>

                {/* Power & Water Flow */}
                <div className="grid grid-cols-2 gap-2 bg-[#111312] p-2 rounded-xl border border-[#252825] text-[10px]">
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    <Flame className="w-3 h-3" />
                    <span>{std.power}W ({std.voltage}V)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#38BDF8] justify-end">
                    <Droplets className="w-3 h-3" />
                    <span>{std.waterFlowLmin} L/m</span>
                  </div>
                </div>

                {/* Mini T1 - T9 telemetry values */}
                <div className="grid grid-cols-5 text-center text-[9px] gap-1 pt-1 border-t border-[#252825]">
                  <div className="bg-[#202321] p-1 rounded">
                    <span className="text-[#7C827C] block text-[8px]">T1</span>
                    <span className="font-bold text-[#EF4444]">{std.t1}&deg;</span>
                  </div>
                  <div className="bg-[#202321] p-1 rounded">
                    <span className="text-[#7C827C] block text-[8px]">T4</span>
                    <span className="font-bold text-[#EAB308]">{std.t4}&deg;</span>
                  </div>
                  <div className="bg-[#202321] p-1 rounded">
                    <span className="text-[#7C827C] block text-[8px]">T7</span>
                    <span className="font-bold text-[#2563EB]">{std.t7}&deg;</span>
                  </div>
                  <div className="bg-[#202321] p-1 rounded">
                    <span className="text-[#7C827C] block text-[8px]">T8</span>
                    <span className="font-bold text-[#38BDF8]">{std.t8}&deg;</span>
                  </div>
                  <div className="bg-[#202321] p-1 rounded">
                    <span className="text-[#7C827C] block text-[8px]">T9</span>
                    <span className="font-bold text-[#A855F7]">{std.t9}&deg;</span>
                  </div>
                </div>

                {/* Inspect Action */}
                <button
                  onClick={() => handleInspectStudent(std)}
                  className="w-full py-2 bg-[#202321] hover:bg-[#102713] text-[#B5BBB5] hover:text-[#39FF14] border border-[#303330] hover:border-[#163D19] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect in 3D Digital Twin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252825] bg-[#111312] flex justify-between items-center text-[#7C827C]">
          <span>Instructor Observation Console &bull; Continuous Telemetry Polling Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Close Monitor
          </button>
        </div>

      </div>
    </div>
  );
};
