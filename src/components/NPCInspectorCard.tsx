import React from 'react';
import { X, Heart, Sparkles, Clock, Utensils, Award, Zap, Shield, User } from 'lucide-react';
import { StaffMember, GuestEntity, PlacedObject } from '../types/restaurant';

interface NPCInspectorCardProps {
  selectedEntity: {
    type: 'guest' | 'staff' | 'object';
    data: GuestEntity | StaffMember | PlacedObject;
  } | null;
  onClose: () => void;
}

export const NPCInspectorCard: React.FC<NPCInspectorCardProps> = ({
  selectedEntity,
  onClose,
}) => {
  if (!selectedEntity) return null;

  const { type, data } = selectedEntity;

  return (
    <div className="absolute top-32 sm:top-20 right-2 sm:right-4 z-40 w-[calc(100vw-1rem)] max-w-80 sm:w-80 max-h-[70vh] overflow-y-auto bg-surface/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-glass animate-fadeIn text-slate-100 select-none">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-base border border-slate-700">
            {type === 'guest' ? '👤' : type === 'staff' ? '👨‍🍳' : '🪑'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white truncate max-w-[170px]">{data.name}</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {type === 'guest'
                ? `Guest • ${(data as GuestEntity).state.replace('_', ' ')}`
                : type === 'staff'
                ? `Staff • ${(data as StaffMember).role.toUpperCase()}`
                : `Furniture • ${(data as PlacedObject).type}`}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Guest Details */}
      {type === 'guest' && (
        (() => {
          const guest = data as GuestEntity;
          const patienceColor =
            guest.patience > 60 ? 'text-emerald-400' : guest.patience > 30 ? 'text-amber-400' : 'text-red-400';
          return (
            <div className="pt-3 flex flex-col gap-3">
              {/* Thought Bubble */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
                <span className="text-xl">{guest.moodEmoji}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Current Thought</span>
                  <p className="text-xs italic text-slate-200 leading-snug">"{guest.thought}"</p>
                </div>
              </div>

              {/* Patience Gauge */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> Patience
                  </span>
                  <span className={patienceColor}>{Math.round(guest.patience)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      guest.patience > 60 ? 'bg-emerald-500' : guest.patience > 30 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(0, guest.patience)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Favorite Food</span>
                  <div className="font-semibold capitalize text-amber-300">{guest.favoriteCategory}</div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Hunger Level</span>
                  <div className="font-semibold text-white">{guest.hunger} / 10</div>
                </div>
              </div>

              {/* Ordered Dish if any */}
              {guest.orderedTicket && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{guest.orderedTicket.menuItem.iconEmoji}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-200">{guest.orderedTicket.menuItem.name}</span>
                      <span className="text-[10px] text-slate-400">Status: {guest.orderedTicket.status}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${guest.orderedTicket.menuItem.sellPrice}
                  </span>
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* Staff Details */}
      {type === 'staff' && (
        (() => {
          const staff = data as StaffMember;
          return (
            <div className="pt-3 flex flex-col gap-3">
              {/* Current Status */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold">Current Activity</span>
                  <span className="text-xs font-bold text-white capitalize">{staff.state.replace('_', ' ')}</span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300">${staff.wagePerHour}/hr</span>
              </div>

              {/* Skill Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">Speed</span>
                    <span className="font-bold text-white">{staff.stats.speed} / 10</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">Cooking</span>
                    <span className="font-bold text-white">{staff.stats.cooking} / 10</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">Charisma</span>
                    <span className="font-bold text-white">{staff.stats.charisma} / 10</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">Sanitation</span>
                    <span className="font-bold text-white">{staff.stats.cleanliness} / 10</span>
                  </div>
                </div>
              </div>

              {/* Lifetime Performance */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-purple-300">
                  <Award className="w-4 h-4" />
                  <span>Tables Served: <strong>{staff.tablesServedCount}</strong></span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">Tips: ${staff.tipsEarned.toFixed(2)}</span>
              </div>
            </div>
          );
        })()
      )}

      {/* Object Details */}
      {type === 'object' && (
        (() => {
          const obj = data as PlacedObject;
          return (
            <div className="pt-3 flex flex-col gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Grid Coordinates</span>
                <span className="text-xs font-mono font-bold text-amber-300">({obj.x}, {obj.y})</span>
              </div>
              {obj.dirtyPlates !== undefined && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Dirty Plates</span>
                  <span className={`text-xs font-bold ${obj.dirtyPlates > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {obj.dirtyPlates > 0 ? `${obj.dirtyPlates} (Needs Busser)` : 'Clean Table'}
                  </span>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
};
