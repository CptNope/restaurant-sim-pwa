import React, { useState } from 'react';
import { X, UserPlus, Trash2, CheckCircle2, Award, Zap, Heart, Sparkles, DollarSign, Shield, Palette } from 'lucide-react';
import { simulation } from '../simulation/RestaurantSimulation';
import { StaffMember, RoleType, AvatarAppearance } from '../types/restaurant';

interface NPCEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffUpdated: () => void;
}

const SKIN_TONES = ['#f7d0b3', '#e0ac69', '#f1c27d', '#ffd1a4', '#8d5524', '#c68642', '#ffe0bd'];
const HAIR_COLORS = ['#171717', '#3a2012', '#78350f', '#d97706', '#92400e', '#ffffff', '#ec4899', '#3b82f6'];
const SHIRT_COLORS = ['#f8fafc', '#1e293b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
const PANTS_COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#78350f', '#1e1b4b'];

export const NPCEditorModal: React.FC<NPCEditorModalProps> = ({
  isOpen,
  onClose,
  onStaffUpdated,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(JSON.parse(JSON.stringify(simulation.staff)));
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');

  if (!isOpen) return null;

  const currentMember = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  const updateSelected = (updater: (prev: StaffMember) => StaffMember) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === selectedStaffId ? updater(s) : s))
    );
  };

  const handleHireNewStaff = (role: RoleType) => {
    const defaultStatsByRole: Record<RoleType, StaffMember['stats']> = {
      host: { speed: 7, cooking: 3, charisma: 9, stamina: 8, cleanliness: 7 },
      waiter: { speed: 8, cooking: 4, charisma: 9, stamina: 9, cleanliness: 8 },
      chef: { speed: 7, cooking: 10, charisma: 6, stamina: 9, cleanliness: 8 },
      busser: { speed: 9, cooking: 2, charisma: 6, stamina: 9, cleanliness: 10 },
      bartender: { speed: 8, cooking: 7, charisma: 9, stamina: 8, cleanliness: 8 },
      manager: { speed: 8, cooking: 8, charisma: 10, stamina: 9, cleanliness: 9 },
    };

    const newStaff: StaffMember = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: `New ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role,
      avatar: {
        skinColor: '#f7d0b3',
        hairColor: '#3a2012',
        hairStyle: role === 'chef' ? 'chef_hat' : 'short',
        shirtColor: role === 'chef' ? '#ffffff' : '#3b82f6',
        pantsColor: '#1e293b',
        hatColor: role === 'chef' ? '#ffffff' : undefined,
      },
      stats: defaultStatsByRole[role],
      energy: 100,
      wagePerHour: role === 'chef' ? 24 : 16,
      state: 'idle',
      pos: { x: 6, y: 6 },
      tablesServedCount: 0,
      tipsEarned: 0,
    };

    setStaffList([...staffList, newStaff]);
    setSelectedStaffId(newStaff.id);
  };

  const handleFireStaff = (id: string) => {
    if (staffList.length <= 1) return;
    const remaining = staffList.filter((s) => s.id !== id);
    setStaffList(remaining);
    setSelectedStaffId(remaining[0].id);
  };

  const handleSaveAndApply = () => {
    simulation.staff = JSON.parse(JSON.stringify(staffList));
    simulation.saveToStorage();
    onStaffUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Staff Roster & Character Studio</h2>
              <p className="text-xs text-slate-400">Customize appearance, skill stats, roles, and manage restaurant staff</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Update Staff</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Staff List */}
          <div className="w-72 border-r border-slate-700/80 bg-slate-900/40 p-4 flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Staff Members ({staffList.length})
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {staffList.map((member) => {
                const isSelected = member.id === selectedStaffId;
                const roleColors: Record<string, string> = {
                  host: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                  waiter: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                  chef: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  busser: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  bartender: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
                  manager: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
                };
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedStaffId(member.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 shadow-glow'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar preview dot */}
                      <div
                        className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center text-xs font-bold shadow-inner"
                        style={{ backgroundColor: member.avatar.shirtColor }}
                      >
                        <span style={{ color: member.avatar.skinColor }}>●</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">{member.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border inline-block w-max font-semibold ${roleColors[member.role]}`}>
                          {member.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">${member.wagePerHour}/hr</span>
                  </div>
                );
              })}
            </div>

            {/* Hire New Staff Action */}
            <div className="mt-auto pt-3 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recruit Staff</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['waiter', 'chef', 'busser', 'host'] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleHireNewStaff(r)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ {r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Staff Details & Visual Customizer */}
          {currentMember && (
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-950/40">
              {/* Profile Card & Avatar Live Render */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                <div className="flex items-center gap-5">
                  {/* Dynamic Visual Avatar Box */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                    {/* Hair */}
                    <div
                      className="w-8 h-4 rounded-t-full absolute top-3"
                      style={{ backgroundColor: currentMember.avatar.hairColor }}
                    />
                    {/* Head */}
                    <div
                      className="w-7 h-7 rounded-full absolute top-4 flex items-center justify-center"
                      style={{ backgroundColor: currentMember.avatar.skinColor }}
                    >
                      <div className="flex gap-1.5">
                        <div className="w-1 h-1 bg-slate-900 rounded-full" />
                        <div className="w-1 h-1 bg-slate-900 rounded-full" />
                      </div>
                    </div>
                    {/* Body */}
                    <div
                      className="w-10 h-7 rounded-t-lg absolute bottom-1 flex justify-center pt-0.5"
                      style={{ backgroundColor: currentMember.avatar.shirtColor }}
                    >
                      {currentMember.role === 'chef' && <div className="w-4 h-4 bg-white rounded-xs" />}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={currentMember.name}
                      onChange={(e) => updateSelected((s) => ({ ...s, name: e.target.value }))}
                      className="text-base font-bold bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={currentMember.role}
                        onChange={(e) => updateSelected((s) => ({ ...s, role: e.target.value as RoleType }))}
                        className="text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-purple-300 focus:outline-none"
                      >
                        <option value="host">Host / Maitre D</option>
                        <option value="waiter">Waiter / Server</option>
                        <option value="chef">Line Cook / Chef</option>
                        <option value="busser">Busser / Dishwasher</option>
                        <option value="bartender">Bartender</option>
                        <option value="manager">General Manager</option>
                      </select>
                      <span className="text-xs text-slate-400">Wage: ${currentMember.wagePerHour}/h</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleFireStaff(currentMember.id)}
                  disabled={staffList.length <= 1}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Terminate Contract</span>
                </button>
              </div>

              {/* Avatar Style Controls */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  Visual Character Customization
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Skin Color */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400">Skin Tone</span>
                    <div className="flex gap-2">
                      {SKIN_TONES.map((color) => (
                        <div
                          key={color}
                          onClick={() => updateSelected((s) => ({ ...s, avatar: { ...s.avatar, skinColor: color } }))}
                          className={`w-7 h-7 rounded-full cursor-pointer border-2 transition ${
                            currentMember.avatar.skinColor === color ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hair Style */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400">Hairstyle</span>
                    <div className="flex gap-1.5">
                      {(['short', 'long', 'curly', 'chef_hat'] as AvatarAppearance['hairStyle'][]).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateSelected((s) => ({ ...s, avatar: { ...s.avatar, hairStyle: style } }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize transition ${
                            currentMember.avatar.hairStyle === style
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {style.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400">Hair Color</span>
                    <div className="flex gap-2">
                      {HAIR_COLORS.map((color) => (
                        <div
                          key={color}
                          onClick={() => updateSelected((s) => ({ ...s, avatar: { ...s.avatar, hairColor: color } }))}
                          className={`w-7 h-7 rounded-full cursor-pointer border-2 transition ${
                            currentMember.avatar.hairColor === color ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Uniform / Shirt Color */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-slate-400">Uniform Shirt Color</span>
                    <div className="flex gap-2">
                      {SHIRT_COLORS.map((color) => (
                        <div
                          key={color}
                          onClick={() => updateSelected((s) => ({ ...s, avatar: { ...s.avatar, shirtColor: color } }))}
                          className={`w-7 h-7 rounded-full cursor-pointer border-2 transition ${
                            currentMember.avatar.shirtColor === color ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RPG Stats Tuning */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Staff Skill Stats
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'speed', label: 'Movement Speed', icon: Zap, color: 'text-blue-400' },
                    { key: 'cooking', label: 'Culinary Prep Speed', icon: Sparkles, color: 'text-amber-400' },
                    { key: 'charisma', label: 'Charisma & Guest Tips', icon: Heart, color: 'text-pink-400' },
                    { key: 'cleanliness', label: 'Sanitation & Bussing', icon: Shield, color: 'text-emerald-400' },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    const val = currentMember.stats[stat.key as keyof StaffMember['stats']];
                    return (
                      <div key={stat.key} className="flex flex-col gap-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold flex items-center gap-1.5 ${stat.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {stat.label}
                          </span>
                          <span className="font-mono font-bold text-white">{val} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={val}
                          onChange={(e) =>
                            updateSelected((s) => ({
                              ...s,
                              stats: { ...s.stats, [stat.key]: parseInt(e.target.value) },
                            }))
                          }
                          className="accent-purple-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
