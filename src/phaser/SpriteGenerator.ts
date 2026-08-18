import Phaser from 'phaser';
import { AvatarAppearance } from '../types/restaurant';

export class SpriteGenerator {
  public static generateAllTextures(scene: Phaser.Scene) {
    this.createFloorTiles(scene);
    this.createFurnitureTextures(scene);
    this.createCharacterBaseTextures(scene);
    this.createIconTextures(scene);
  }

  private static createFloorTiles(scene: Phaser.Scene) {
    const size = 32;

    // 1. Wood Floor
    const woodCanvas = scene.textures.createCanvas('floor_wood', size, size);
    if (woodCanvas) {
      const ctx = woodCanvas.getContext();
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(0, 0, size, size);
      // Wood grain planks
      ctx.fillStyle = '#a06c39';
      ctx.fillRect(0, 0, size, 15);
      ctx.fillRect(0, 16, size, 15);
      ctx.fillStyle = '#6d421d';
      ctx.fillRect(0, 15, size, 1);
      ctx.fillRect(0, 31, size, 1);
      ctx.fillRect(16, 0, 1, 15);
      ctx.fillRect(8, 16, 1, 15);
      woodCanvas.refresh();
    }

    // 2. Kitchen Tile (Checkerboard)
    const kitchenCanvas = scene.textures.createCanvas('floor_kitchen', size, size);
    if (kitchenCanvas) {
      const ctx = kitchenCanvas.getContext();
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, size / 2, size / 2);
      ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, size, size);
      kitchenCanvas.refresh();
    }

    // 3. Wall Tile
    const wallCanvas = scene.textures.createCanvas('wall', size, size);
    if (wallCanvas) {
      const ctx = wallCanvas.getContext();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, size - 6, size, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 0, size, 3); // Neon top rim
      wallCanvas.refresh();
    }

    // 4. Door Entrance
    const doorCanvas = scene.textures.createCanvas('door_in', size, size);
    if (doorCanvas) {
      const ctx = doorCanvas.getContext();
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#065f46';
      ctx.fillRect(4, 4, size - 8, size - 8);
      ctx.fillStyle = '#34d399';
      ctx.font = '10px sans-serif';
      ctx.fillText('ENTER', 2, 20);
      doorCanvas.refresh();
    }
  }

  private static createFurnitureTextures(scene: Phaser.Scene) {
    const size = 32;

    // Table 2P (64x64)
    const table2Canvas = scene.textures.createCanvas('table_2p', size * 2, size * 2);
    if (table2Canvas) {
      const ctx = table2Canvas.getContext();
      // Chairs Top and Bottom
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(32, 12, 10, 0, Math.PI * 2);
      ctx.arc(32, 52, 10, 0, Math.PI * 2);
      ctx.fill();

      // Tabletop (Mahogany Wood with White Tablecloth runner)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(14, 16, 36, 32, 6);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(20, 16, 24, 32);

      // Candle / Centerpiece
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(32, 32, 4, 0, Math.PI * 2);
      ctx.fill();

      table2Canvas.refresh();
    }

    // Table 4P (64x64)
    const table4Canvas = scene.textures.createCanvas('table_4p', size * 2, size * 2);
    if (table4Canvas) {
      const ctx = table4Canvas.getContext();
      // 4 Chairs around
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.arc(32, 10, 8, 0, Math.PI * 2);
      ctx.arc(32, 54, 8, 0, Math.PI * 2);
      ctx.arc(10, 32, 8, 0, Math.PI * 2);
      ctx.arc(54, 32, 8, 0, Math.PI * 2);
      ctx.fill();

      // Big Table
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.roundRect(16, 16, 32, 32, 4);
      ctx.fill();
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(19, 19, 26, 26, 3);
      ctx.fill();

      table4Canvas.refresh();
    }

    // Stove / Grill (32x64)
    const stoveCanvas = scene.textures.createCanvas('stove_grill', size, size * 2);
    if (stoveCanvas) {
      const ctx = stoveCanvas.getContext();
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, size, size * 2);
      // Burners
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.arc(16, 48, 10, 0, Math.PI * 2);
      ctx.fill();
      // Orange Glowing Flame Rings
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.stroke();
      stoveCanvas.refresh();
    }

    // Prep Counter (32x64)
    const prepCanvas = scene.textures.createCanvas('prep_counter', size, size * 2);
    if (prepCanvas) {
      const ctx = prepCanvas.getContext();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, size, size * 2);
      // Cutting boards
      ctx.fillStyle = '#fde047';
      ctx.fillRect(6, 8, 20, 20);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(6, 36, 20, 20);
      prepCanvas.refresh();
    }

    // Pizza Oven (32x64)
    const ovenCanvas = scene.textures.createCanvas('pizza_oven', size, size * 2);
    if (ovenCanvas) {
      const ctx = ovenCanvas.getContext();
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(0, 0, size, size * 2);
      // Stone Arch
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(16, 32, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(16, 32, 8, 0, Math.PI * 2);
      ctx.fill();
      ovenCanvas.refresh();
    }

    // Pickup Counter (32x96)
    const pickupCanvas = scene.textures.createCanvas('pickup_counter', size, size * 3);
    if (pickupCanvas) {
      const ctx = pickupCanvas.getContext();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, size, size * 3);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(4, 4, size - 8, (size * 3) - 8);
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('PASS', 4, 48);
      pickupCanvas.refresh();
    }

    // Host Stand (32x32)
    const hostCanvas = scene.textures.createCanvas('host_stand', size, size);
    if (hostCanvas) {
      const ctx = hostCanvas.getContext();
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(4, 4, 24, 24);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(8, 8, 16, 12);
      hostCanvas.refresh();
    }

    // Drink Station (64x32)
    const drinkCanvas = scene.textures.createCanvas('drink_station', size * 2, size);
    if (drinkCanvas) {
      const ctx = drinkCanvas.getContext();
      ctx.fillStyle = '#312e81';
      ctx.fillRect(0, 0, size * 2, size);
      // Neon Taps & Glasses
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, 6, 8, 20);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(26, 6, 8, 20);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(42, 6, 8, 20);
      drinkCanvas.refresh();
    }

    // Sink (32x64)
    const sinkCanvas = scene.textures.createCanvas('sink_dishwasher', size, size * 2);
    if (sinkCanvas) {
      const ctx = sinkCanvas.getContext();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, size, size * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, 8, 24, 20);
      ctx.fillRect(4, 36, 24, 20);
      sinkCanvas.refresh();
    }

    // Decor Plant (32x32)
    const plantCanvas = scene.textures.createCanvas('decor_plant', size, size);
    if (plantCanvas) {
      const ctx = plantCanvas.getContext();
      ctx.fillStyle = '#78350f'; // Pot
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d'; // Leaves
      ctx.beginPath();
      ctx.arc(12, 12, 6, 0, Math.PI * 2);
      ctx.arc(20, 12, 6, 0, Math.PI * 2);
      ctx.arc(16, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      plantCanvas.refresh();
    }
  }

  private static createCharacterBaseTextures(scene: Phaser.Scene) {
    const size = 32;
    // Default Character Base
    const charCanvas = scene.textures.createCanvas('char_base', size, size);
    if (charCanvas) {
      const ctx = charCanvas.getContext();
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 28, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body / Torso
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(8, 12, 16, 14, 4);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f7d0b3';
      ctx.beginPath();
      ctx.arc(16, 10, 7, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(16, 7, 7, Math.PI, Math.PI * 2);
      ctx.fill();

      charCanvas.refresh();
    }
  }

  public static generateCustomAvatarTexture(
    scene: Phaser.Scene,
    textureKey: string,
    avatar: AvatarAppearance,
    role?: string
  ) {
    if (scene.textures.exists(textureKey)) {
      scene.textures.remove(textureKey);
    }

    const size = 32;
    const canvas = scene.textures.createCanvas(textureKey, size, size);
    if (!canvas) return;

    const ctx = canvas.getContext();

    // Soft Floor Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(16, 29, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pants / Legs
    ctx.fillStyle = avatar.pantsColor || '#1e293b';
    ctx.fillRect(10, 22, 5, 8);
    ctx.fillRect(17, 22, 5, 8);

    // Torso / Shirt
    ctx.fillStyle = avatar.shirtColor || '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(8, 12, 16, 12, 4);
    ctx.fill();

    // Role specific details (e.g. Waiter tie / Chef apron)
    if (role === 'chef') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 14, 10, 10);
    } else if (role === 'waiter') {
      ctx.fillStyle = '#ef4444'; // Red bow-tie
      ctx.fillRect(14, 13, 4, 3);
    }

    // Head
    ctx.fillStyle = avatar.skinColor || '#f7d0b3';
    ctx.beginPath();
    ctx.arc(16, 9, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(14, 8, 1.5, 2);
    ctx.fillRect(17, 8, 1.5, 2);

    // Hair or Chef Hat
    if (avatar.hairStyle === 'chef_hat' || role === 'chef') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 2, 12, 6);
      ctx.beginPath();
      ctx.arc(16, 2, 6, Math.PI, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = avatar.hairColor || '#1e293b';
      if (avatar.hairStyle === 'long') {
        ctx.beginPath();
        ctx.arc(16, 7, 7, 0, Math.PI * 2);
        ctx.fillRect(9, 7, 14, 10);
        ctx.fill();
      } else if (avatar.hairStyle === 'curly') {
        ctx.beginPath();
        ctx.arc(16, 6, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Short hair
        ctx.beginPath();
        ctx.arc(16, 6, 7, Math.PI, Math.PI * 2);
        ctx.fill();
      }
    }

    canvas.refresh();
  }

  private static createIconTextures(scene: Phaser.Scene) {
    // Dirty plate icon
    const plateCanvas = scene.textures.createCanvas('icon_dirty_plate', 16, 16);
    if (plateCanvas) {
      const ctx = plateCanvas.getContext();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#b45309'; // Food stain
      ctx.fillRect(5, 5, 5, 4);
      plateCanvas.refresh();
    }

    // Food Tray Icon
    const trayCanvas = scene.textures.createCanvas('icon_tray', 20, 12);
    if (trayCanvas) {
      const ctx = trayCanvas.getContext();
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 4, 20, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(10, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      trayCanvas.refresh();
    }
  }
}
