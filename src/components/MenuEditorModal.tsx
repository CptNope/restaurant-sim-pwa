import React, { useState } from 'react';
import { X, Plus, CheckCircle2, UtensilsCrossed, DollarSign, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { simulation, INITIAL_MENU } from '../simulation/RestaurantSimulation';
import { MenuItem } from '../types/restaurant';

interface MenuEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuUpdated: () => void;
}

const EMOJI_OPTIONS = ['🍔', '🍕', '🍟', '🥗', '🥩', '🍣', '🍜', '🌮', '🍝', '🍰', '🍦', '🍹', '☕', '🍷', '🍩'];

export const MenuEditorModal: React.FC<MenuEditorModalProps> = ({
  isOpen,
  onClose,
  onMenuUpdated,
}) => {
  const [menu, setMenu] = useState<MenuItem[]>(JSON.parse(JSON.stringify(simulation.menu)));
  const [selectedItemId, setSelectedItemId] = useState<string>(menu[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<MenuItem['category']>('main');

  if (!isOpen) return null;

  const currentItem = menu.find((m) => m.id === selectedItemId) || menu[0];

  const updateSelected = (updater: (prev: MenuItem) => MenuItem) => {
    setMenu((prev) =>
      prev.map((m) => (m.id === selectedItemId ? updater(m) : m))
    );
  };

  const handleCreateNewDish = () => {
    const newDish: MenuItem = {
      id: `dish_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: 'Chef Specialty Recipe',
      category: activeCategory,
      prepStation: 'stove_grill',
      prepTimeSeconds: 4.0,
      costToMake: 4.0,
      sellPrice: 16.0,
      popularity: 8,
      qualityRating: 4.8,
      unlocked: true,
      iconColor: '#f59e0b',
      iconEmoji: '🥩',
      description: 'Handcrafted signature dish made with premium farm-to-table ingredients.',
    };

    setMenu([...menu, newDish]);
    setSelectedItemId(newDish.id);
  };

  const handleDeleteDish = (id: string) => {
    if (menu.length <= 1) return;
    const remaining = menu.filter((m) => m.id !== id);
    setMenu(remaining);
    setSelectedItemId(remaining[0].id);
  };

  const handleSaveAndApply = () => {
    simulation.menu = JSON.parse(JSON.stringify(menu));
    simulation.saveToStorage();
    onMenuUpdated();
    onClose();
  };

  const profitMargin = currentItem
    ? (((currentItem.sellPrice - currentItem.costToMake) / currentItem.sellPrice) * 100).toFixed(0)
    : '0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Menu & Culinary Recipe Studio</h2>
              <p className="text-xs text-slate-400">Formulate dishes, assign cooking stations, set margins, and balance flavors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-glow transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Menu</span>
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
          {/* Left Menu List */}
          <div className="w-80 border-r border-slate-700/80 bg-slate-900/40 p-4 flex flex-col gap-3 overflow-y-auto">
            {/* Category Filter Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              {(['main', 'appetizer', 'dessert', 'drink'] as MenuItem['category'][]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    activeCategory === cat ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dishes list */}
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
              {menu
                .filter((item) => item.category === activeCategory)
                .map((item) => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.iconEmoji}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{item.name}</span>
                          <span className="text-[10px] text-slate-400">Prep: {item.prepTimeSeconds}s • Rating: {item.qualityRating}★</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-emerald-400">${item.sellPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Cost ${item.costToMake.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Create Dish Button */}
            <button
              onClick={handleCreateNewDish}
              className="mt-auto flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create New Recipe</span>
            </button>
          </div>

          {/* Right Recipe Formulation Studio */}
          {currentItem && (
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-950/40">
              {/* Dish Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                <div className="flex items-center gap-4">
                  <span className="text-4xl p-3 bg-slate-950 rounded-2xl border border-slate-700 shadow-inner">
                    {currentItem.iconEmoji}
                  </span>
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={currentItem.name}
                      onChange={(e) => updateSelected((m) => ({ ...m, name: e.target.value }))}
                      className="text-base font-bold bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">Category: {currentItem.category.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 font-mono">
                      {profitMargin}% Profit Margin
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteDish(currentItem.id)}
                    className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs transition"
                  >
                    Delete Dish
                  </button>
                </div>
              </div>

              {/* Recipe Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pricing & Costs */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Economics & Pricing
                  </span>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Customer Sell Price ($)</label>
                      <input
                        type="number"
                        step="0.50"
                        min="1"
                        value={currentItem.sellPrice}
                        onChange={(e) => updateSelected((m) => ({ ...m, sellPrice: parseFloat(e.target.value) || 1 }))}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Ingredient Cost To Make ($)</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0.5"
                        value={currentItem.costToMake}
                        onChange={(e) => updateSelected((m) => ({ ...m, costToMake: parseFloat(e.target.value) || 0.5 }))}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Kitchen Station & Prep Time */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Kitchen Station Workflow
                  </span>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400">Required Cooking Appliance</label>
                      <select
                        value={currentItem.prepStation}
                        onChange={(e) =>
                          updateSelected((m) => ({ ...m, prepStation: e.target.value as MenuItem['prepStation'] }))
                        }
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 text-xs font-semibold focus:outline-none"
                      >
                        <option value="stove_grill">🔥 Commercial Gas Grill</option>
                        <option value="pizza_oven">🍕 Stone Pizza Oven</option>
                        <option value="fryer">🍟 Twin Deep Fryer</option>
                        <option value="prep_counter">🥗 Salad / Cutting Board</option>
                        <option value="drink_station">🍸 Cocktail & Espresso Bar</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Cooking Prep Time</span>
                        <span className="font-mono text-white font-bold">{currentItem.prepTimeSeconds}s</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="10.0"
                        step="0.5"
                        value={currentItem.prepTimeSeconds}
                        onChange={(e) => updateSelected((m) => ({ ...m, prepTimeSeconds: parseFloat(e.target.value) }))}
                        className="accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Emoji Icon Picker & Description */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Visual Icon & Dish Description
                </span>

                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => updateSelected((m) => ({ ...m, iconEmoji: emoji }))}
                      className={`text-2xl p-2 rounded-xl border transition ${
                        currentItem.iconEmoji === emoji
                          ? 'bg-amber-500/20 border-amber-500 scale-110'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Menu Description</label>
                  <textarea
                    rows={2}
                    value={currentItem.description}
                    onChange={(e) => updateSelected((m) => ({ ...m, description: e.target.value }))}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
