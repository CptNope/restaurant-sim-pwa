import Phaser from 'phaser';
import { simulation } from '../simulation/RestaurantSimulation';
import { SpriteGenerator } from './SpriteGenerator';
import { StaffMember, GuestEntity, PlacedObject } from '../types/restaurant';

export class RestaurantScene extends Phaser.Scene {
  public static readonly TILE_SIZE = 32;
  public static readonly MIN_ZOOM = 0.7;
  public static readonly MAX_ZOOM = 2.0;

  private floorContainer!: Phaser.GameObjects.Container;
  private objectContainer!: Phaser.GameObjects.Container;
  private entityContainer!: Phaser.GameObjects.Container;
  private uiContainer!: Phaser.GameObjects.Container;

  private staffSpriteMap = new Map<string, {
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite;
    roleText: Phaser.GameObjects.Text;
    carriedItem?: Phaser.GameObjects.Image;
  }>();

  private guestSpriteMap = new Map<string, {
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite;
    bubbleText: Phaser.GameObjects.Text;
    patienceBar: Phaser.GameObjects.Graphics;
  }>();

  private objectSpriteMap = new Map<string, {
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite;
    progressBar?: Phaser.GameObjects.Graphics;
    dirtyBadge?: Phaser.GameObjects.Text;
  }>();

  public onEntitySelected?: (entity: { type: 'guest' | 'staff' | 'object'; data: GuestEntity | StaffMember | PlacedObject }) => void;

  constructor() {
    super({ key: 'RestaurantScene' });
  }

  create() {
    SpriteGenerator.generateAllTextures(this);

    this.floorContainer = this.add.container(0, 0);
    this.objectContainer = this.add.container(0, 0);
    this.entityContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);

    this.renderFloorGrid();
    this.renderObjects();

    // Camera setup
    const worldWidth = simulation.gridWidth * RestaurantScene.TILE_SIZE;
    const worldHeight = simulation.gridHeight * RestaurantScene.TILE_SIZE;
    this.updateCameraBounds();
    this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);

    // Bounds must be re-derived whenever the canvas is resized (window resize,
    // orientation change, mobile browser chrome show/hide): they're sized
    // around the current viewport so a fixed rect would go stale.
    this.scale.on('resize', () => this.updateCameraBounds());

    // Pan & Zoom controls
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      if (deltaY > 0) {
        this.cameras.main.setZoom(Math.max(RestaurantScene.MIN_ZOOM, zoom - 0.1));
      } else {
        this.cameras.main.setZoom(Math.min(RestaurantScene.MAX_ZOOM, zoom + 0.1));
      }
    });

    let isDragging = false;
    let dragStartPos = { x: 0, y: 0 };

    // Touch gesture state: single-finger pan + two-finger pinch-to-zoom
    const activeTouches = new Map<number, { x: number; y: number }>();
    const TOUCH_DRAG_THRESHOLD = 8;
    let touchPanStart: { x: number; y: number } | null = null;
    let touchPanCameraStart = { x: 0, y: 0 };
    let isTouchPanning = false;
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;

    const isTouchPointer = (pointer: Phaser.Input.Pointer) => pointer.wasTouch;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() || pointer.middleButtonDown() || pointer.event.shiftKey) {
        isDragging = true;
        dragStartPos = { x: pointer.x, y: pointer.y };
        return;
      }

      if (!isTouchPointer(pointer)) return;

      activeTouches.set(pointer.id, { x: pointer.x, y: pointer.y });

      if (activeTouches.size === 1) {
        touchPanStart = { x: pointer.x, y: pointer.y };
        touchPanCameraStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
        isTouchPanning = false;
      } else if (activeTouches.size === 2) {
        const [p1, p2] = Array.from(activeTouches.values());
        pinchStartDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        pinchStartZoom = this.cameras.main.zoom;
        touchPanStart = null;
        isTouchPanning = false;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        this.cameras.main.scrollX -= (pointer.x - dragStartPos.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (pointer.y - dragStartPos.y) / this.cameras.main.zoom;
        dragStartPos = { x: pointer.x, y: pointer.y };
        return;
      }

      if (!isTouchPointer(pointer) || !activeTouches.has(pointer.id)) return;
      activeTouches.set(pointer.id, { x: pointer.x, y: pointer.y });

      if (activeTouches.size === 2) {
        const [p1, p2] = Array.from(activeTouches.values());
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        if (pinchStartDistance > 0) {
          const newZoom = Phaser.Math.Clamp(
            pinchStartZoom * (dist / pinchStartDistance),
            RestaurantScene.MIN_ZOOM,
            RestaurantScene.MAX_ZOOM
          );
          this.cameras.main.setZoom(newZoom);
        }
      } else if (activeTouches.size === 1 && touchPanStart) {
        const dx = pointer.x - touchPanStart.x;
        const dy = pointer.y - touchPanStart.y;
        if (!isTouchPanning && Math.hypot(dx, dy) > TOUCH_DRAG_THRESHOLD) {
          isTouchPanning = true;
        }
        if (isTouchPanning) {
          this.cameras.main.scrollX = touchPanCameraStart.x - dx / this.cameras.main.zoom;
          this.cameras.main.scrollY = touchPanCameraStart.y - dy / this.cameras.main.zoom;
        }
      }
    });

    const endTouch = (pointer: Phaser.Input.Pointer) => {
      if (!isTouchPointer(pointer)) return;
      activeTouches.delete(pointer.id);

      if (activeTouches.size < 2) pinchStartDistance = 0;

      if (activeTouches.size === 1) {
        // One finger remains after a pinch or a multi-touch release: resume panning from here
        const remaining = Array.from(activeTouches.values())[0];
        touchPanStart = { x: remaining.x, y: remaining.y };
        touchPanCameraStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
        isTouchPanning = false;
      } else if (activeTouches.size === 0) {
        touchPanStart = null;
        isTouchPanning = false;
      }
    };

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      isDragging = false;
      endTouch(pointer);
    });

    this.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      endTouch(pointer);
    });
  }

  /**
   * Camera bounds must stay large enough to contain the viewport at the
   * most-zoomed-out level (MIN_ZOOM). If bounds are smaller than the
   * viewport-in-world-units at the current zoom, Phaser clamps the camera
   * flush against an edge and panning stops working entirely in that
   * direction — this is what caused the map to get "stuck" at the top
   * once zoomed out on a tall viewport. Padding is derived from the canvas
   * size so it self-adjusts on resize/orientation change instead of being
   * a fixed guess.
   */
  private updateCameraBounds() {
    const worldWidth = simulation.gridWidth * RestaurantScene.TILE_SIZE;
    const worldHeight = simulation.gridHeight * RestaurantScene.TILE_SIZE;
    const viewportWidthAtMinZoom = this.scale.width / RestaurantScene.MIN_ZOOM;
    const viewportHeightAtMinZoom = this.scale.height / RestaurantScene.MIN_ZOOM;

    const padX = Math.max(50, (viewportWidthAtMinZoom - worldWidth) / 2 + 50);
    const padY = Math.max(50, (viewportHeightAtMinZoom - worldHeight) / 2 + 50);

    this.cameras.main.setBounds(-padX, -padY, worldWidth + padX * 2, worldHeight + padY * 2);
  }

  public renderFloorGrid() {
    this.floorContainer.removeAll(true);
    for (let y = 0; y < simulation.gridHeight; y++) {
      for (let x = 0; x < simulation.gridWidth; x++) {
        const tileType = simulation.tiles[y]?.[x] || 'floor_wood';
        const px = x * RestaurantScene.TILE_SIZE;
        const py = y * RestaurantScene.TILE_SIZE;
        const img = this.add.image(px, py, tileType).setOrigin(0, 0);
        this.floorContainer.add(img);
      }
    }
  }

  public renderObjects() {
    this.objectContainer.removeAll(true);
    this.objectSpriteMap.clear();

    for (const obj of simulation.objects) {
      const px = obj.x * RestaurantScene.TILE_SIZE;
      const py = obj.y * RestaurantScene.TILE_SIZE;
      const objContainer = this.add.container(px, py);

      const sprite = this.add.sprite(0, 0, obj.type).setOrigin(0, 0);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        this.onEntitySelected?.({ type: 'object', data: obj });
      });

      objContainer.add(sprite);

      // Dirty plates badge
      const dirtyBadge = this.add.text(obj.width * 16, 0, '', {
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#ef4444',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5, 0.5).setVisible(false);
      objContainer.add(dirtyBadge);

      // Progress bar for cooking equipment
      const progressBar = this.add.graphics();
      objContainer.add(progressBar);

      this.objectContainer.add(objContainer);
      this.objectSpriteMap.set(obj.id, {
        container: objContainer,
        sprite,
        progressBar,
        dirtyBadge,
      });
    }
  }

  update(_time: number, delta: number) {
    simulation.update(delta);

    this.updateStaffSprites();
    this.updateGuestSprites();
    this.updateObjectStates();
  }

  private updateStaffSprites() {
    const currentStaffIds = new Set<string>();

    for (const member of simulation.staff) {
      currentStaffIds.add(member.id);
      let entry = this.staffSpriteMap.get(member.id);

      const targetPx = member.pos.x * RestaurantScene.TILE_SIZE + 16;
      const targetPy = member.pos.y * RestaurantScene.TILE_SIZE + 16;

      if (!entry) {
        // Generate custom avatar texture
        const textureKey = `avatar_staff_${member.id}`;
        SpriteGenerator.generateCustomAvatarTexture(this, textureKey, member.avatar, member.role);

        const container = this.add.container(targetPx, targetPy);
        const sprite = this.add.sprite(0, 0, textureKey).setOrigin(0.5, 0.5);
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', () => {
          this.onEntitySelected?.({ type: 'staff', data: member });
        });

        // Role title tag
        const roleColors: Record<string, string> = {
          host: '#a855f7',
          waiter: '#3b82f6',
          chef: '#f59e0b',
          busser: '#10b981',
          bartender: '#ec4899',
          manager: '#6366f1',
        };
        const roleText = this.add.text(0, -18, member.role.toUpperCase(), {
          fontSize: '8px',
          color: '#ffffff',
          backgroundColor: roleColors[member.role] || '#475569',
          padding: { x: 3, y: 1 },
        }).setOrigin(0.5, 0.5);

        container.add([sprite, roleText]);
        this.entityContainer.add(container);

        entry = { container, sprite, roleText };
        this.staffSpriteMap.set(member.id, entry);
      }

      // Smooth interpolation movement
      entry.container.x = Phaser.Math.Linear(entry.container.x, targetPx, 0.25);
      entry.container.y = Phaser.Math.Linear(entry.container.y, targetPy, 0.25);

      // Render carried items
      if (member.carriedItem && !entry.carriedItem) {
        const itemImg = this.add.image(8, -4, member.carriedItem.type === 'food' ? 'icon_tray' : 'icon_dirty_plate');
        entry.container.add(itemImg);
        entry.carriedItem = itemImg;
      } else if (!member.carriedItem && entry.carriedItem) {
        entry.carriedItem.destroy();
        entry.carriedItem = undefined;
      }
    }

    // Cleanup removed staff
    for (const [id, entry] of this.staffSpriteMap.entries()) {
      if (!currentStaffIds.has(id)) {
        entry.container.destroy();
        this.staffSpriteMap.delete(id);
      }
    }
  }

  private updateGuestSprites() {
    const currentGuestIds = new Set<string>();

    for (const guest of simulation.guests) {
      if (guest.state === 'exited') continue;
      currentGuestIds.add(guest.id);

      const targetPx = guest.pos.x * RestaurantScene.TILE_SIZE + 16;
      const targetPy = guest.pos.y * RestaurantScene.TILE_SIZE + 16;

      let entry = this.guestSpriteMap.get(guest.id);
      if (!entry) {
        const textureKey = `avatar_guest_${guest.id}`;
        SpriteGenerator.generateCustomAvatarTexture(this, textureKey, guest.avatar);

        const container = this.add.container(targetPx, targetPy);
        const sprite = this.add.sprite(0, 0, textureKey).setOrigin(0.5, 0.5);
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', () => {
          this.onEntitySelected?.({ type: 'guest', data: guest });
        });

        // Speech bubble emoji
        const bubbleText = this.add.text(0, -20, guest.moodEmoji, {
          fontSize: '13px',
          backgroundColor: '#1e293b',
          padding: { x: 3, y: 1 },
        }).setOrigin(0.5, 0.5);

        const patienceBar = this.add.graphics();

        container.add([sprite, bubbleText, patienceBar]);
        this.entityContainer.add(container);

        entry = { container, sprite, bubbleText, patienceBar };
        this.guestSpriteMap.set(guest.id, entry);
      }

      // Smooth interpolation movement
      entry.container.x = Phaser.Math.Linear(entry.container.x, targetPx, 0.2);
      entry.container.y = Phaser.Math.Linear(entry.container.y, targetPy, 0.2);

      // Update Mood emoji
      entry.bubbleText.setText(guest.moodEmoji);

      // Render patience bar
      entry.patienceBar.clear();
      if (guest.state !== 'paid_leaving' && guest.state !== 'angry_leaving') {
        const pct = Math.max(0, guest.patience / 100);
        const barColor = pct > 0.6 ? 0x10b981 : pct > 0.3 ? 0xf59e0b : 0xef4444;
        entry.patienceBar.fillStyle(0x0f172a, 0.8);
        entry.patienceBar.fillRect(-12, -10, 24, 3);
        entry.patienceBar.fillStyle(barColor, 1);
        entry.patienceBar.fillRect(-12, -10, 24 * pct, 3);
      }
    }

    // Cleanup exited guests
    for (const [id, entry] of this.guestSpriteMap.entries()) {
      if (!currentGuestIds.has(id)) {
        entry.container.destroy();
        this.guestSpriteMap.delete(id);
      }
    }
  }

  private updateObjectStates() {
    for (const obj of simulation.objects) {
      const entry = this.objectSpriteMap.get(obj.id);
      if (!entry) continue;

      // Update dirty badge
      if (obj.dirtyPlates && obj.dirtyPlates > 0) {
        entry.dirtyBadge?.setVisible(true).setText(`🍽️ x${obj.dirtyPlates}`);
      } else {
        entry.dirtyBadge?.setVisible(false);
      }

      // Update cooking progress
      if (entry.progressBar) {
        entry.progressBar.clear();
        const activeTicket = simulation.tickets.find(
          t => t.status === 'cooking' && t.menuItem.prepStation === obj.type && obj.inUseByStaffId
        );
        if (activeTicket) {
          const pct = activeTicket.prepProgress / 100;
          entry.progressBar.fillStyle(0x0f172a, 0.8);
          entry.progressBar.fillRect(2, -6, 28, 4);
          entry.progressBar.fillStyle(0x10b981, 1);
          entry.progressBar.fillRect(2, -6, 28 * pct, 4);
        }
      }
    }
  }

  public reloadLayout() {
    this.renderFloorGrid();
    this.renderObjects();
  }
}
