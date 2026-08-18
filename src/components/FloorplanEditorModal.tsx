import React, { useState } from 'react';
import { X, RotateCw, Trash2, CheckCircle2, ShieldAlert, Sparkles, Hammer, Sofa, Flame, Coffee, Trees } from 'lucide-react';
import { simulation, INITIAL_OBJECTS } from '../simulation/RestaurantSimulation';
import { PlacedObject, StationType, TileType } from '../types/restaurant';

interface FloorplanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLayoutUpdated: () => void;
}

interface PaletteItem {
  type: StationType;
  name: string;
  category: 'dining' | 'kitchen' | 'drinks' | 'sanitation' | 'decor';
  width: number;
  height: number;
  cost: number;
  icon: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Dining
  { type: 'table_2p', name: '2-Top Dining Table', category: 'dining', width: 2, height: 2, cost: 120, icon: '🪑' },
  { type: 'table_4p', name: '4-Top Family Booth', category: 'dining', width: 2, height: 2, cost: 240, icon: '🛋️' },
  { type: 'host_stand', name: 'Maitre D Stand', category: 'dining', width: 1, height: 1, cost: 100, icon: '📋' },
  
  // Kitchen
  { type: 'prep_counter', name: 'Cutting Prep Board', category: 'kitchen', width: 1, height: 2, cost: 150, icon: '🥗' },
  { type: 'stove_grill', name: 'Commercial Gas Grill', category: 'kitchen', width: 1, height: 2, cost: 350, icon: '🔥' },
  { type: 'pizza_oven', name: 'Stone Pizza Oven', category: 'kitchen', width: 1, height: 2, cost: 450, icon: '🍕' },
  { type: 'fryer', name: 'Twin Deep Fryer', category: 'kitchen', width: 1, height: 1, cost: 200, icon: '🍟' },
  { type: 'pickup_counter', name: 'Plating Pass Counter', category: 'kitchen', width: 1, height: 3, cost: 280, icon: '🍽️' },

  // Drinks
  { type: 'drink_station', name: 'Cocktail & Espresso Bar', category: 'drinks', width: 2, height: 1, cost: 300, icon: '🍸' },

  // Sanitation
  { type: 'sink_dishwasher', name: 'Dishwashing Sink', category: 'sanitation', width: 1, height: 2, cost: 220, icon: '🧼' },
  { type: 'trash_bin', name: 'Stainless Trash Bin', category: 'sanitation', width: 1, height: 1, cost: 50, icon: '🗑️' },

  // Decor
  { type: 'decor_plant', name: 'Monstera Plant', category: 'decor', width: 1, height: 1, cost: 45, icon: '🪴' },
];

export const FloorplanEditorModal: React.FC<FloorplanEditorModalProps> = ({
  isOpen,
  onClose,
  onLayoutUpdated,
}) => {
  const [objects, setObjects] = useState<PlacedObject[]>(JSON.parse(JSON.stringify(simulation.objects)));
  const [selectedTool, setSelectedTool] = useState<'place' | 'select' | 'erase'>('place');
  const [activePaletteItem, setActivePaletteItem] = useState<PaletteItem>(PALETTE_ITEMS[0]);
  const [selectedCategory, setSelectedCategory] = useState<PaletteItem['category']>('dining');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);

  if (!isOpen) return null;

  const gridWidth = simulation.gridWidth;
  const gridHeight = simulation.gridHeight;

  const handleCellClick = (x: number, y: number) => {
    // Perimeter wall check
    if (x === 0 || y === 0 || x === gridWidth - 1 || y === gridHeight - 1) return;

    if (selectedTool === 'erase') {
      const target = objects.find(
        o => x >= o.x && x < o.x + o.width && y >= o.y && y < o.y + o.height
      );
      if (target) {
        setObjects(objects.filter(o => o.id !== target.id));
        if (selectedObjectId === target.id) setSelectedObjectId(null);
      }
      return;
    }

    if (selectedTool === 'place') {
      const w = rotation === 90 || rotation === 270 ? activePaletteItem.height : activePaletteItem.width;
      const h = rotation === 90 || rotation === 270 ? activePaletteItem.width : activePaletteItem.height;

      // Check bounds
      if (x + w >= gridWidth || y + h >= gridHeight) return;

      // Check overlap
      const overlaps = objects.some(o => {
        return !(x + w <= o.x || x >= o.x + o.width || y + h <= o.y || y >= o.y + o.height);
      });
      if (overlaps) return;

      // Create new object
      const newObj: PlacedObject = {
        id: `obj_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        type: activePaletteItem.type,
        x,
        y,
        width: w,
        height: h,
        rotation,
        name: activePaletteItem.name,
        isObstacle: true,
        interactionPoints: [{ x: Math.max(1, x - 1), y }],
        seatPositions: activePaletteItem.type.startsWith('table') ? [{ x, y }] : undefined,
        dirtyPlates: 0,
      };

      setObjects([...objects, newObj]);
    } else if (selectedTool === 'select') {
      const target = objects.find(
        o => x >= o.x && x < o.x + o.width && y >= o.y && y < o.y + o.height
      );
      setSelectedObjectId(target ? target.id : null);
    }
  };

  const handleSaveAndApply = () => {
    simulation.objects = JSON.parse(JSON.stringify(objects));
    simulation.updateCollisionGrid();
    simulation.saveToStorage();
    onLayoutUpdated();
    onClose();
  };

  const handleResetDefault = () => {
    setObjects(JSON.parse(JSON.stringify(INITIAL_OBJECTS)));
  };

  const loadPreset = (presetName: 'diner' | 'italian' | 'sushi') => {
    if (presetName === 'diner') {
      setObjects(JSON.parse(JSON.stringify(INITIAL_OBJECTS)));
    } else if (presetName === 'italian') {
      // 4 big tables + 2 pizza ovens
      const italianLayout: PlacedObject[] = [
        { id: 'obj_h', type: 'host_stand', x: 4, y: 2, width: 1, height: 1, rotation: 0, name: 'Maitre D', isObstacle: true, interactionPoints: [{ x: 4, y: 3 }] },
        { id: 't1', type: 'table_4p', x: 3, y: 5, width: 2, height: 2, rotation: 0, name: 'Bistro Table #1', isObstacle: true, interactionPoints: [{ x: 2, y: 5 }], seatPositions: [{ x: 3, y: 5 }] },
        { id: 't2', type: 'table_4p', x: 7, y: 5, width: 2, height: 2, rotation: 0, name: 'Bistro Table #2', isObstacle: true, interactionPoints: [{ x: 6, y: 5 }], seatPositions: [{ x: 7, y: 5 }] },
        { id: 't3', type: 'table_4p', x: 3, y: 9, width: 2, height: 2, rotation: 0, name: 'Bistro Table #3', isObstacle: true, interactionPoints: [{ x: 2, y: 9 }], seatPositions: [{ x: 3, y: 9 }] },
        { id: 't4', type: 'table_4p', x: 7, y: 9, width: 2, height: 2, rotation: 0, name: 'Bistro Table #4', isObstacle: true, interactionPoints: [{ x: 6, y: 9 }], seatPositions: [{ x: 7, y: 9 }] },
        { id: 'o1', type: 'pizza_oven', x: 13, y: 5, width: 1, height: 2, rotation: 0, name: 'Wood Oven Alpha', isObstacle: true, interactionPoints: [{ x: 12, y: 5 }] },
        { id: 'o2', type: 'pizza_oven', x: 13, y: 8, width: 1, height: 2, rotation: 0, name: 'Wood Oven Beta', isObstacle: true, interactionPoints: [{ x: 12, y: 8 }] },
        { id: 'pass', type: 'pickup_counter', x: 11, y: 6, width: 1, height: 3, rotation: 0, name: 'Plating Pass', isObstacle: true, interactionPoints: [{ x: 10, y: 7 }] },
        { id: 'sink', type: 'sink_dishwasher', x: 13, y: 11, width: 1, height: 2, rotation: 0, name: 'Sanitation Sink', isObstacle: true, interactionPoints: [{ x: 12, y: 11 }] },
        { id: 'bar', type: 'drink_station', x: 8, y: 2, width: 2, height: 1, rotation: 0, name: 'Wine Bar', isObstacle: true, interactionPoints: [{ x: 8, y: 3 }] },
      ];
      setObjects(italianLayout);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="bg-surface border border-slate-700/80 sm:rounded-2xl w-full max-w-5xl h-full sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2 truncate">
                Floorplan & Architecture Studio
              </h2>
              <p className="hidden sm:block text-xs text-slate-400">Design restaurant layout, arrange seating, and build kitchen workflows</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleSaveAndApply}
              title="Apply to Restaurant"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-glow-green transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Apply to Restaurant</span>
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Palette Sidebar */}
          <div className="w-full md:w-80 max-h-[38vh] md:max-h-none shrink-0 border-b md:border-b-0 md:border-r border-slate-700/80 bg-slate-900/40 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Tool Selection */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
              <button
                onClick={() => setSelectedTool('place')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTool === 'place' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Place Object
              </button>
              <button
                onClick={() => setSelectedTool('erase')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTool === 'erase' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bulldoze
              </button>
            </div>

            {/* Rotation and Presets */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate {rotation}°</span>
              </button>
              <button
                onClick={handleResetDefault}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                Reset Default
              </button>
            </div>

            {/* Layout Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Layout Templates</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => loadPreset('diner')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition text-left"
                >
                  🍔 Classic Diner
                </button>
                <button
                  onClick={() => loadPreset('italian')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition text-left"
                >
                  🍕 Italian Trattoria
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Object Categories</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'dining', label: 'Dining', icon: Sofa },
                  { id: 'kitchen', label: 'Kitchen', icon: Flame },
                  { id: 'drinks', label: 'Drinks', icon: Coffee },
                  { id: 'sanitation', label: 'Wash', icon: Trash2 },
                  { id: 'decor', label: 'Decor', icon: Trees },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as PaletteItem['category'])}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Palette Items Grid */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalog Items</span>
              <div className="grid grid-cols-1 gap-2">
                {PALETTE_ITEMS.filter((item) => item.category === selectedCategory).map((item) => {
                  const isSelected = activePaletteItem.type === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => {
                        setActivePaletteItem(item);
                        setSelectedTool('place');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-glow-blue'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{item.name}</span>
                          <span className="text-[10px] text-slate-400">{item.width}x{item.height} tiles</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">${item.cost}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Grid Canvas Area */}
          <div className="flex-1 p-3 sm:p-6 flex flex-col items-center justify-center bg-slate-950/60 overflow-auto">
            <div
              className="grid gap-0.5 p-3 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl relative"
              style={{
                gridTemplateColumns: `repeat(${gridWidth}, 28px)`,
                gridTemplateRows: `repeat(${gridHeight}, 28px)`,
              }}
            >
              {Array.from({ length: gridHeight }).map((_, y) =>
                Array.from({ length: gridWidth }).map((_, x) => {
                  const isWall = x === 0 || y === 0 || x === gridWidth - 1 || y === gridHeight - 1;
                  const isEntrance = x === 2 && y === 15;
                  const isKitchen = x >= 11;

                  // Find placed object on this tile
                  const obj = objects.find(
                    (o) => x >= o.x && x < o.x + o.width && y >= o.y && y < o.y + o.height
                  );

                  const isObjOrigin = obj && obj.x === x && obj.y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      onMouseEnter={() => setPreviewPos({ x, y })}
                      className={`w-7 h-7 flex items-center justify-center text-xs relative select-none transition-colors ${
                        isEntrance
                          ? 'bg-emerald-600/80 text-white font-bold'
                          : isWall
                          ? 'bg-slate-800 border border-slate-700 text-slate-500'
                          : isKitchen
                          ? 'bg-slate-800/40 border border-slate-800 hover:bg-slate-700/50'
                          : 'bg-amber-950/20 border border-amber-900/20 hover:bg-amber-900/40'
                      }`}
                    >
                      {isEntrance && '🚪'}
                      {isObjOrigin && (
                        <div
                          className="absolute inset-0 bg-blue-600/60 border border-blue-400 rounded-sm flex items-center justify-center text-xs font-bold text-white z-10"
                          style={{
                            width: `${obj.width * 28 + (obj.width - 1) * 2}px`,
                            height: `${obj.height * 28 + (obj.height - 1) * 2}px`,
                          }}
                        >
                          <span className="truncate px-1 text-[10px]">{obj.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-950/40 border border-amber-800 inline-block rounded"></span> Dining Hall</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-800 border border-slate-700 inline-block rounded"></span> Kitchen Zone</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-600 border border-blue-400 inline-block rounded"></span> Placed Object</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-600 inline-block rounded"></span> Guest Entrance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
