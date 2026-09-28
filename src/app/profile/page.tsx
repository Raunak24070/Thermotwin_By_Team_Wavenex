
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Building, 
  GraduationCap, 
  Mail, 
  IdCard, 
  Calendar, 
  FileText, 
  Save, 
  CheckCircle2, 
  FlaskConical, 
  Activity, 
  Users, 
  BarChart3,
  Sparkles,
  Upload
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';
import { useRealtimeMonitorStore } from '@/store/useRealtimeMonitorStore';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
];

export default function ProfilePage() {
  const router = useNavigate();
  const { currentUser, isAuthenticated, updateProfile } = useAuthStore();
  const { submissions, classes, students } = useClassStore();
  const { liveStudents } = useRealtimeMonitorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [institution, setInstitution] = useState(currentUser?.institution || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [idNumber, setIdNumber] = useState(currentUser?.studentIdNumber || currentUser?.teacherIdNumber || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isAuthenticated || !currentUser) {
    if (typeof window !== 'undefined') router('/login');
    return null;
  }

  const isTeacher = currentUser.role === 'TEACHER';

  // Stats
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const avgError = mySubmissions.length > 0
    ? (mySubmissions.reduce((acc, s) => acc + s.percentageError, 0) / mySubmissions.length).toFixed(2)
    : '0.00';

  // Handle Image File Upload (Convert to DataURL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setAvatarUrl(resultStr);
        updateProfile({ avatarUrl: resultStr });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    setAvatarUrl(url);
    updateProfile({ avatarUrl: url });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      institution: institution.trim(),
      department: department.trim(),
      bio: bio.trim(),
      studentIdNumber: !isTeacher ? idNumber.trim() : undefined,
      teacherIdNumber: isTeacher ? idNumber.trim() : undefined,
      avatarUrl
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 py-2 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Profile Picture Uploader */}
        <div className="relative group shrink-0">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
            alt={name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-800 shadow-xl"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
            title="Upload Custom Profile Picture"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Main Details */}
        <div className="flex-1 text-center md:text-left flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-100">{currentUser.name}</h1>
            <span className={`text-xs font-mono px-3 py-0.5 rounded-full font-bold border ${
              isTeacher 
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {currentUser.role}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {currentUser.email}
            </span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              {currentUser.institution}
            </span>
            <span className="flex items-center gap-1">
              <IdCard className="w-3.5 h-3.5 text-slate-500" />
              ID: {currentUser.studentIdNumber || currentUser.teacherIdNumber || 'N/A'}
            </span>
          </p>

          <p className="text-xs text-slate-300 max-w-xl italic mt-1">
            "{currentUser.bio || 'Passionate thermal engineering learner exploring heat transfer phenomena.'}"
          </p>

          {/* Quick Presets */}
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <span className="text-[10px] font-mono text-slate-500">Avatar Presets:</span>
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPresetAvatar(url)}
                className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                  avatarUrl === url ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-slate-700 hover:border-slate-400'
                }`}
              >
                <img src={url} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Profile updated successfully! Avatar &amp; details saved.
        </div>
      )}

      {/* Role Academic Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isTeacher ? (
          <>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono">MANAGED CLASSES</span>
              <div className="text-2xl font-black font-mono text-indigo-400 my-1">{classes.length}</div>
              <span className="text-[10px] text-slate-500">Active class sections</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono">TOTAL STUDENTS</span>
              <div className="text-2xl font-black font-mono text-slate-100 my-1">{students.length}</div>
              <span className="text-[10px] text-slate-500">Enrolled students</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono">LAB SUBMISSIONS</span>
              <div className="text-2xl font-black font-mono text-amber-400 my-1">{submissions.length}</div>
              <span className="text-[10px] text-slate-500">Submitted for review</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono">ATTEMPTS COMPLETED</span>
              <div className="text-2xl font-black font-mono text-amber-400 my-1">{mySubmissions.length}</div>
              <span className="text-[10px] text-slate-500">Virtual Lab Submissions</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono">AVG CONDUCTANCE ERROR %</span>
              <div className="text-2xl font-black font-mono text-emerald-400 my-1">{avgError}%</div>
              <span className="text-[10px] text-slate-500">Accuracy vs theoretical k</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono">ACTIVE ENROLLMENT</span>
              <div className="text-xs font-bold font-mono text-slate-200 my-1 truncate">ME 302 — Heat Lab</div>
              <span className="text-[10px] text-amber-400">Class Code: THERMO-7K2P</span>
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Edit Profile &amp; Institution Details
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Institution / University</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Department / Specialization</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">
              {isTeacher ? 'Faculty / Teacher ID' : 'Student Roll / Registration ID'}
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 block mb-1">Academic Bio / Notes</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
