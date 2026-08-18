import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { RestaurantScene } from './RestaurantScene';
import { StaffMember, GuestEntity, PlacedObject } from '../types/restaurant';

interface PhaserContainerProps {
  onSelectEntity: (entity: { type: 'guest' | 'staff' | 'object'; data: GuestEntity | StaffMember | PlacedObject } | null) => void;
  sceneRef?: React.MutableRefObject<RestaurantScene | null>;
}

export const PhaserContainer: React.FC<PhaserContainerProps> = ({ onSelectEntity, sceneRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new RestaurantScene();
    if (sceneRef) sceneRef.current = scene;

    scene.onEntitySelected = (entity) => {
      onSelectEntity(entity);
    };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth || 800,
      height: containerRef.current.clientHeight || 600,
      backgroundColor: '#0a0d14',
      render: {
        pixelArt: true,
        antialias: false,
      },
      scene: [scene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        activePointers: 3, // track up to 3 simultaneous touches for pinch-to-zoom
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        gameRef.current.scale.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      game.destroy(true);
      gameRef.current = null;
      if (sceneRef) sceneRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden touch-none"
      onClick={(e) => {
        // Deselect if clicking on empty area of background
        if (e.target === containerRef.current) {
          onSelectEntity(null);
        }
      }}
    />
  );
};
