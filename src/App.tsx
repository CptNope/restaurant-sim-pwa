import React, { useState, useRef, useEffect } from 'react';
import { PhaserContainer } from './phaser/PhaserContainer';
import { RestaurantScene } from './phaser/RestaurantScene';
import { HUD } from './components/HUD';
import { FloorplanEditorModal } from './components/FloorplanEditorModal';
import { NPCEditorModal } from './components/NPCEditorModal';
import { MenuEditorModal } from './components/MenuEditorModal';
import { SettingsModal } from './components/SettingsModal';
import { OrderQueueTracker } from './components/OrderQueueTracker';
import { DailyReportModal } from './components/DailyReportModal';
import { NPCInspectorCard } from './components/NPCInspectorCard';
import { simulation } from './simulation/RestaurantSimulation';
import { StaffMember, GuestEntity, PlacedObject } from './types/restaurant';

export function App() {
  const sceneRef = useRef<RestaurantScene | null>(null);

  // Modals state
  const [isFloorplanOpen, setIsFloorplanOpen] = useState(false);
  const [isStaffEditorOpen, setIsStaffEditorOpen] = useState(false);
  const [isMenuEditorOpen, setIsMenuEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Selected Entity Inspector
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'guest' | 'staff' | 'object';
    data: GuestEntity | StaffMember | PlacedObject;
  } | null>(null);

  const [activeTicketCount, setActiveTicketCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const active = simulation.tickets.filter((t) => t.status !== 'served' && t.status !== 'cancelled').length;
      setActiveTicketCount(active);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        simulation.isPaused = !simulation.isPaused;
      } else if (e.key === '1') {
        simulation.gameSpeed = 1.0;
      } else if (e.key === '2') {
        simulation.gameSpeed = 2.5;
      } else if (e.key === '5') {
        simulation.gameSpeed = 5.0;
      } else if (e.key.toLowerCase() === 'f') {
        setIsFloorplanOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 's') {
        setIsStaffEditorOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        setIsMenuEditorOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 't') {
        setIsTicketsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        setIsReviewsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLayoutUpdated = () => {
    if (sceneRef.current) {
      sceneRef.current.reloadLayout();
    }
  };

  return (
    <div className="w-screen h-screen relative bg-background overflow-hidden">
      {/* 2D Topdown Phaser Game Canvas */}
      <PhaserContainer
        sceneRef={sceneRef}
        onSelectEntity={(entity) => setSelectedEntity(entity)}
      />

      {/* Main HUD Overlay */}
      <HUD
        onOpenFloorplan={() => setIsFloorplanOpen(true)}
        onOpenStaffEditor={() => setIsStaffEditorOpen(true)}
        onOpenMenuEditor={() => setIsMenuEditorOpen(true)}
        onOpenTickets={() => setIsTicketsOpen(true)}
        onOpenReviews={() => setIsReviewsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTicketCount={activeTicketCount}
      />

      {/* NPC / Object Inspector Card */}
      <NPCInspectorCard
        selectedEntity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
      />

      {/* Slide-over Live Order Tickets */}
      <OrderQueueTracker
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
      />

      {/* Floorplan Grid Builder Modal */}
      <FloorplanEditorModal
        isOpen={isFloorplanOpen}
        onClose={() => setIsFloorplanOpen(false)}
        onLayoutUpdated={handleLayoutUpdated}
      />

      {/* Staff & Character Customization Studio Modal */}
      <NPCEditorModal
        isOpen={isStaffEditorOpen}
        onClose={() => setIsStaffEditorOpen(false)}
        onStaffUpdated={() => {
          if (sceneRef.current) {
            sceneRef.current.reloadLayout();
          }
        }}
      />

      {/* Menu & Recipe Editor Modal */}
      <MenuEditorModal
        isOpen={isMenuEditorOpen}
        onClose={() => setIsMenuEditorOpen(false)}
        onMenuUpdated={() => {}}
      />

      {/* Daily Ledger & Reviews Modal */}
      <DailyReportModal
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
      />

      {/* Game Settings & AI Director Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={() => {
          if (sceneRef.current) {
            sceneRef.current.reloadLayout();
          }
        }}
      />
    </div>
  );
}

export default App;
