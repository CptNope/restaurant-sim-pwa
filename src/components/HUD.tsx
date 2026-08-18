import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  Sparkles,
  Volume2,
  VolumeX,
  LayoutGrid,
  Users,
  UtensilsCrossed,
  Receipt,
  Star,
  DollarSign,
  Clock,
  Sliders,
  Award,
} from 'lucide-react';
import { simulation } from '../simulation/RestaurantSimulation';
import { soundEngine } from '../simulation/SoundEngine';

interface HUDProps {
  onOpenFloorplan: () => void;
  onOpenStaffEditor: () => void;
  onOpenMenuEditor: () => void;
  onOpenTickets: () => void;
  onOpenReviews: () => void;
  onOpenSettings: () => void;
  activeTicketCount: number;
}

export const HUD: React.FC<HUDProps> = ({
  onOpenFloorplan,
  onOpenStaffEditor,
  onOpenMenuEditor,
  onOpenTickets,
  onOpenReviews,
  onOpenSettings,
  activeTicketCount,
}) => {
  const [cash, setCash] = React.useState(simulation.stats.cash);
  const [revenue, setRevenue] = React.useState(simulation.stats.dailyRevenue);
  const [stars, setStars] = React.useState(simulation.stats.reputationStars);
  const [served, setServed] = React.useState(simulation.stats.dailyCustomersServed);
  const [isPaused, setIsPaused] = React.useState(simulation.isPaused);
  const [gameSpeed, setGameSpeed] = React.useState(simulation.gameSpeed);
  const [aiEnabled, setAiEnabled] = React.useState(simulation.aiSettings.enabled);
  const [isMuted, setIsMuted] = React.useState(soundEngine.getMuted());
  const [notifications, setNotifications] = React.useState(simulation.getNotifications());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCash(simulation.stats.cash);
      setRevenue(simulation.stats.dailyRevenue);
      setStars(simulation.stats.reputationStars);
      setServed(simulation.stats.dailyCustomersServed);
      setNotifications([...simulation.getNotifications()]);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-3 select-none pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto bg-surface/85 backdrop-blur-md border border-slate-700/60 rounded-2xl p-2 sm:p-2.5 shadow-glass">
        {/* Brand & Day */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-glow text-slate-900 font-extrabold text-lg sm:text-xl shrink-0">
            🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-wide text-white">ChefAI Bistro</h1>
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                DAY {simulation.day}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTime(simulation.timeOfDaySeconds)}</span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-2 md:gap-5 flex-wrap">
          {/* Balance */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/30 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-glow-green">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Cash</span>
              <span className="text-sm font-bold text-emerald-300 font-mono">${cash.toFixed(2)}</span>
            </div>
          </div>

          {/* Daily Revenue */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/50 px-3 py-1.5 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Today Revenue</span>
              <span className="text-sm font-bold text-amber-300 font-mono">+${revenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Reputation Stars */}
          <div
            onClick={onOpenReviews}
            className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-500/30 px-2.5 sm:px-3 py-1.5 rounded-xl cursor-pointer hover:border-amber-400 transition"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Rating</span>
              <span className="text-sm font-bold text-amber-200 font-mono">{stars.toFixed(1)} ★</span>
            </div>
          </div>

          {/* Customers Served */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/50 px-3 py-1.5 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Guests Served</span>
              <span className="text-sm font-bold text-blue-300 font-mono">{served}</span>
            </div>
          </div>
        </div>

        {/* Controls: Speed, Auto-Pilot, Audio */}
        <div className="flex items-center gap-2">
          {/* Autonomous AI Toggle */}
          <button
            onClick={() => {
              simulation.aiSettings.enabled = !aiEnabled;
              setAiEnabled(!aiEnabled);
              simulation.addNotification(
                !aiEnabled ? '🤖 Autonomous AI Director: ENGAGED' : '⏸️ Autonomous AI Director: MANUAL MODE'
              );
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              aiEnabled
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-glow'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle autonomous AI auto-pilot"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiEnabled ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{aiEnabled ? 'AI Auto-Pilot: ON' : 'AI: OFF'}</span>
          </button>

          {/* Speed Controls */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1 gap-1">
            <button
              onClick={() => {
                simulation.isPaused = !isPaused;
                setIsPaused(!isPaused);
              }}
              className={`p-1.5 rounded-lg transition ${
                isPaused ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                simulation.gameSpeed = 1.0;
                setGameSpeed(1.0);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                gameSpeed === 1.0 && !isPaused ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => {
                simulation.gameSpeed = 2.5;
                setGameSpeed(2.5);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                gameSpeed === 2.5 && !isPaused ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FastForward className="w-3.5 h-3.5 inline" /> <span className="hidden sm:inline">2.5x</span>
            </button>
            <button
              onClick={() => {
                simulation.gameSpeed = 5.0;
                setGameSpeed(5.0);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                gameSpeed === 5.0 && !isPaused ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              5x
            </button>
          </div>

          {/* Audio Mute Button */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              soundEngine.setMuted(nextMuted);
              setIsMuted(nextMuted);
            }}
            className="p-2 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Live AI / System Notification Ticker (Top Left) */}
      {notifications.length > 0 && (
        <div className="pointer-events-auto max-w-md mt-2 flex flex-col gap-1">
          <div className="bg-surface/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-2.5 shadow-lg text-xs text-slate-200 flex items-start gap-2 animate-fadeIn">
            <span className="text-amber-400 font-bold">📢</span>
            <p className="line-clamp-2 leading-relaxed">{notifications[0]}</p>
          </div>
        </div>
      )}

      {/* Bottom Main Navigation Action Bar */}
      <div className="flex justify-center pointer-events-auto mt-auto max-w-full overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-surface/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-1.5 sm:p-2 shadow-glass flex-wrap justify-center">
          <button
            onClick={onOpenFloorplan}
            title="Floorplan Builder"
            aria-label="Floorplan Builder"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <LayoutGrid className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Floorplan Builder</span>
          </button>

          <button
            onClick={onOpenStaffEditor}
            title="Staff & NPC Editor"
            aria-label="Staff & NPC Editor"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Staff & NPC Editor</span>
          </button>

          <button
            onClick={onOpenMenuEditor}
            title="Menu & Recipes"
            aria-label="Menu & Recipes"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Menu & Recipes</span>
          </button>

          <button
            onClick={onOpenTickets}
            title="Live Tickets"
            aria-label="Live Tickets"
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Live Tickets</span>
            {activeTicketCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                {activeTicketCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenReviews}
            title="Reviews & Daily Report"
            aria-label="Reviews & Daily Report"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <Award className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Reviews & Daily Report</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Game Settings"
            aria-label="Game Settings"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Game Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
