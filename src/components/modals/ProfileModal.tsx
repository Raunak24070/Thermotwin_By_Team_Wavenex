import React from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Building, 
  CheckCircle2, 
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/db';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, registeredUsers, loginUser } = useAuthStore();

  if (!isOpen) return null;

  const handleSwitchAccount = (email: string) => {
    loginUser(email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wide">
              USER PROFILE &bull; STATION CREDENTIALS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active User Profile Card */}
        <div className="p-5 flex flex-col gap-4 bg-[#0D0F0E]">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              className="w-14 h-14 rounded-2xl border-2 border-[#39FF14] object-cover glow-green-sm"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#F5F5F5]">{currentUser?.name}</h3>
                <span className="px-1.5 py-0.2 rounded bg-[#102713] text-[#39FF14] border border-[#163D19] text-[9px] font-bold">
                  {currentUser?.role === 'TEACHER' ? 'FACULTY' : 'STUDENT'}
                </span>
              </div>
              <span className="text-[11px] text-[#7C827C]">{currentUser?.email}</span>
              <span className="text-[10px] text-[#8BEA63] mt-0.5">{currentUser?.institution}</span>
            </div>
          </div>

          <div className="bg-[#171918] p-3 rounded-xl border border-[#252825] divide-y divide-[#252825] text-[11px]">
            <div className="py-1.5 flex justify-between">
              <span className="text-[#7C827C]">Station ID:</span>
              <span className="font-bold text-[#E8ECE8]">
                {currentUser?.studentIdNumber || currentUser?.teacherIdNumber || 'STN-101'}
              </span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-[#7C827C]">Department:</span>
              <span className="text-[#E8ECE8]">{currentUser?.department}</span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-[#7C827C]">Enrolled Section:</span>
              <span className="text-[#39FF14] font-bold">ME 302 &bull; THERMO-7K2P</span>
            </div>
          </div>

          {/* Fast Switch User Role / Account */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
            <span className="text-[10px] text-[#7C827C] uppercase tracking-wider font-semibold">
              SWITCH LAB ROLE / PROFILE
            </span>

            <div className="flex flex-col gap-1.5">
              {registeredUsers.map((u) => {
                const isActive = u.id === currentUser?.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchAccount(u.email)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#102713] border-[#163D19] text-[#39FF14]'
                        : 'bg-[#171918] border-[#252825] text-[#B5BBB5] hover:border-[#303330] hover:text-[#F5F5F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{u.name}</span>
                      <span className="text-[9px] text-[#7C827C]">({u.role === 'TEACHER' ? 'Instructor' : 'Student'})</span>
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-[#39FF14]">&bull; Active</span>
                    ) : (
                      <span className="text-[10px] text-[#7C827C]">Switch &rarr;</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252825] bg-[#111312] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
