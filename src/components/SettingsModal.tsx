import React, { useState } from 'react';
import { X, Sparkles, Download, Upload, RefreshCw, Volume2, ShieldCheck, Smartphone, Check } from 'lucide-react';
import { simulation } from '../simulation/RestaurantSimulation';
import { soundEngine } from '../simulation/SoundEngine';
import { AIPolicyMode, AIPolicySettings } from '../types/restaurant';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [aiSettings, setAiSettings] = useState<AIPolicySettings>(JSON.parse(JSON.stringify(simulation.aiSettings)));
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  React.useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    simulation.aiSettings = JSON.parse(JSON.stringify(aiSettings));
    soundEngine.setMuted(isMuted);
    simulation.saveToStorage();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onSettingsUpdated();
  };

  const handleExportJSON = () => {
    const data = {
      restaurantName: 'ChefAI Bistro',
      day: simulation.day,
      stats: simulation.stats,
      staff: simulation.staff,
      menu: simulation.menu,
      objects: simulation.objects,
      aiSettings: simulation.aiSettings,
      reviews: simulation.reviews,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chefai-restaurant-day${simulation.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.stats) simulation.stats = parsed.stats;
        if (parsed.staff) simulation.staff = parsed.staff;
        if (parsed.menu) simulation.menu = parsed.menu;
        if (parsed.objects) simulation.objects = parsed.objects;
        if (parsed.aiSettings) simulation.aiSettings = parsed.aiSettings;
        if (parsed.reviews) simulation.reviews = parsed.reviews;
        if (parsed.day) simulation.day = parsed.day;
        simulation.updateCollisionGrid();
        simulation.saveToStorage();
        onSettingsUpdated();
        onClose();
      } catch (err) {
        alert('Invalid JSON restaurant save file');
      }
    };
    reader.readAsText(file);
  };

  const handleInstallPWA = () => {
    if (installPrompt && 'prompt' in installPrompt) {
      (installPrompt as unknown as { prompt: () => void }).prompt();
    } else {
      alert('To install, use your browser menu -> "Install App" or "Add to Home Screen"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Game Settings & AI Director</h2>
              <p className="text-xs text-slate-400">Configure autonomous AI behavior, sound, save states, and PWA options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto bg-slate-950/40">
          {/* Autonomous AI Policy Settings */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Autonomous AI Director Mode
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiSettings.enabled}
                  onChange={(e) => setAiSettings({ ...aiSettings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* AI Policy Cards */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'balanced', title: '⚖️ Balanced Auto-Pilot', desc: 'Optimal staff cross-training, steady queue flow, stable margins.' },
                { id: 'aggressive_marketing', title: '🚀 Aggressive Marketing', desc: 'Maximum guest volume, rapid table turnover, quick service priority.' },
                { id: 'vip_luxury', title: '⭐ VIP 5-Star Focus', desc: 'Prioritizes guest patience, zero delays, top tip multipliers.' },
                { id: 'budget_saver', title: '💰 Budget Saving Mode', desc: 'Cuts unnecessary overhead, tight inventory control, lean operations.' },
              ].map((policy) => (
                <div
                  key={policy.id}
                  onClick={() => setAiSettings({ ...aiSettings, mode: policy.id as AIPolicyMode })}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${
                    aiSettings.mode === policy.id
                      ? 'bg-purple-600/20 border-purple-500 shadow-glow'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white">{policy.title}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{policy.desc}</span>
                </div>
              ))}
            </div>

            {/* Auto Policies Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {[
                { key: 'autoRestockIngredients', label: 'Auto-Restock Wholesale Ingredients' },
                { key: 'autoReassignStaffRoles', label: 'Auto-Rebalance Bottlenecked Roles' },
                { key: 'autoHireWhenQueuesLong', label: 'Auto-Hire When Queues Overflow' },
                { key: 'autoCleanTablesUrgent', label: 'Prioritize Urgent Table Bussing' },
              ].map((flag) => (
                <label key={flag.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!aiSettings[flag.key as keyof AIPolicySettings]}
                    onChange={(e) =>
                      setAiSettings({ ...aiSettings, [flag.key]: e.target.checked })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sound & Audio */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Web Audio Sound FX</span>
                <span className="text-[10px] text-slate-400">Procedural audio for sizzling pans, clinking coins & dishes</span>
              </div>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isMuted
                  ? 'bg-red-600/20 text-red-400 border-red-500/30'
                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isMuted ? 'Muted' : 'Sound ON'}
            </button>
          </div>

          {/* Data Export & Backup */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Save States & JSON Backup
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export Save File</span>
              </button>

              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Import Save File</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={handleInstallPWA}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Install PWA App</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset restaurant back to Day 1 default state?')) {
                    simulation.resetToDefault();
                    onSettingsUpdated();
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold transition ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Restaurant</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-700/80 bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            {saveSuccess && (
              <>
                <Check className="w-4 h-4" /> Settings Saved!
              </>
            )}
          </span>
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-glow transition"
          >
            Save & Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
