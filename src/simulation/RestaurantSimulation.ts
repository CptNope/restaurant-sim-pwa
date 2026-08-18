import {
  PlacedObject,
  StaffMember,
  GuestEntity,
  OrderTicket,
  MenuItem,
  TileType,
  RestaurantStats,
  AIPolicySettings,
  GuestReview,
  GridPos,
  StationType,
  RoleType,
  AvatarAppearance,
} from '../types/restaurant';
import { AStarPathfinder } from './aStar';
import { soundEngine } from './SoundEngine';
import { aiDirector } from './AutonomousAI';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'dish_burger',
    name: 'Artisan Smash Burger',
    category: 'main',
    prepStation: 'stove_grill',
    prepTimeSeconds: 4.5,
    costToMake: 4.50,
    sellPrice: 15.00,
    popularity: 9,
    qualityRating: 4.8,
    unlocked: true,
    iconColor: '#f59e0b',
    iconEmoji: '🍔',
    description: 'Double smashed Wagyu patty, aged cheddar, caramelized onion relish on brioche.'
  },
  {
    id: 'dish_pizza',
    name: 'Truffle Neapolitan Pizza',
    category: 'main',
    prepStation: 'pizza_oven',
    prepTimeSeconds: 6.0,
    costToMake: 5.00,
    sellPrice: 18.50,
    popularity: 8,
    qualityRating: 4.9,
    unlocked: true,
    iconColor: '#ef4444',
    iconEmoji: '🍕',
    description: 'Wood-fired sourdough crust, San Marzano tomato sauce, fior di latte & black truffle.'
  },
  {
    id: 'dish_fries',
    name: 'Crispy Truffle Fries',
    category: 'appetizer',
    prepStation: 'fryer',
    prepTimeSeconds: 3.0,
    costToMake: 2.00,
    sellPrice: 8.50,
    popularity: 10,
    qualityRating: 4.6,
    unlocked: true,
    iconColor: '#eab308',
    iconEmoji: '🍟',
    description: 'Hand-cut russet potatoes, parmesan snow, fresh rosemary, black truffle aioli.'
  },
  {
    id: 'dish_salad',
    name: 'Burrata Citrus Salad',
    category: 'appetizer',
    prepStation: 'prep_counter',
    prepTimeSeconds: 2.5,
    costToMake: 3.50,
    sellPrice: 12.00,
    popularity: 7,
    qualityRating: 4.7,
    unlocked: true,
    iconColor: '#10b981',
    iconEmoji: '🥗',
    description: 'Creamy Pugliese burrata, heirloom tomatoes, blood orange slices & basil reduction.'
  },
  {
    id: 'dish_cocktail',
    name: 'Smoked Amber Old Fashioned',
    category: 'drink',
    prepStation: 'drink_station',
    prepTimeSeconds: 2.0,
    costToMake: 2.50,
    sellPrice: 14.00,
    popularity: 8,
    qualityRating: 5.0,
    unlocked: true,
    iconColor: '#8b5cf6',
    iconEmoji: '🍹',
    description: 'Barrel-aged bourbon, aromatic bitters, charred orange peel, hickory smoke infusion.'
  },
  {
    id: 'dish_lava_cake',
    name: 'Molten Chocolate Cake',
    category: 'dessert',
    prepStation: 'pizza_oven',
    prepTimeSeconds: 4.0,
    costToMake: 3.00,
    sellPrice: 10.50,
    popularity: 9,
    qualityRating: 4.9,
    unlocked: true,
    iconColor: '#d97706',
    iconEmoji: '🍰',
    description: 'Warm Valrhona dark chocolate cake with molten core & Madagascar vanilla gelato.'
  }
];

export const INITIAL_OBJECTS: PlacedObject[] = [
  // Host Stand at Entrance
  {
    id: 'obj_host',
    type: 'host_stand',
    x: 4,
    y: 2,
    width: 1,
    height: 1,
    rotation: 0,
    name: 'Maitre D Stand',
    isObstacle: true,
    interactionPoints: [{ x: 4, y: 3 }, { x: 3, y: 2 }],
  },
  // Dining Tables & Chairs
  {
    id: 'table_1',
    type: 'table_2p',
    x: 3,
    y: 6,
    width: 2,
    height: 2,
    rotation: 0,
    name: 'Window Table #1',
    isObstacle: true,
    interactionPoints: [{ x: 2, y: 6 }, { x: 5, y: 6 }],
    seatPositions: [{ x: 3, y: 6 }, { x: 4, y: 6 }],
    dirtyPlates: 0,
  },
  {
    id: 'table_2',
    type: 'table_2p',
    x: 7,
    y: 6,
    width: 2,
    height: 2,
    rotation: 0,
    name: 'Center Table #2',
    isObstacle: true,
    interactionPoints: [{ x: 6, y: 6 }, { x: 9, y: 6 }],
    seatPositions: [{ x: 7, y: 6 }, { x: 8, y: 6 }],
    dirtyPlates: 0,
  },
  {
    id: 'table_3',
    type: 'table_4p',
    x: 3,
    y: 10,
    width: 2,
    height: 2,
    rotation: 0,
    name: 'Booth Table #3',
    isObstacle: true,
    interactionPoints: [{ x: 2, y: 10 }, { x: 5, y: 10 }],
    seatPositions: [{ x: 3, y: 10 }, { x: 4, y: 10 }],
    dirtyPlates: 0,
  },
  {
    id: 'table_4',
    type: 'table_4p',
    x: 7,
    y: 10,
    width: 2,
    height: 2,
    rotation: 0,
    name: 'Booth Table #4',
    isObstacle: true,
    interactionPoints: [{ x: 6, y: 10 }, { x: 9, y: 10 }],
    seatPositions: [{ x: 7, y: 10 }, { x: 8, y: 10 }],
    dirtyPlates: 0,
  },
  // Kitchen Equipment
  {
    id: 'kitchen_prep',
    type: 'prep_counter',
    x: 13,
    y: 4,
    width: 1,
    height: 2,
    rotation: 0,
    name: 'Salad & Cutting Board',
    isObstacle: true,
    interactionPoints: [{ x: 12, y: 4 }, { x: 12, y: 5 }],
  },
  {
    id: 'kitchen_stove',
    type: 'stove_grill',
    x: 13,
    y: 6,
    width: 1,
    height: 2,
    rotation: 0,
    name: 'Commercial Gas Grill',
    isObstacle: true,
    interactionPoints: [{ x: 12, y: 6 }, { x: 12, y: 7 }],
  },
  {
    id: 'kitchen_oven',
    type: 'pizza_oven',
    x: 13,
    y: 8,
    width: 1,
    height: 2,
    rotation: 0,
    name: 'Stone Pizza Oven',
    isObstacle: true,
    interactionPoints: [{ x: 12, y: 8 }, { x: 12, y: 9 }],
  },
  {
    id: 'kitchen_fryer',
    type: 'fryer',
    x: 13,
    y: 10,
    width: 1,
    height: 1,
    rotation: 0,
    name: 'Twin Deep Fryer',
    isObstacle: true,
    interactionPoints: [{ x: 12, y: 10 }],
  },
  {
    id: 'kitchen_pickup',
    type: 'pickup_counter',
    x: 11,
    y: 6,
    width: 1,
    height: 3,
    rotation: 0,
    name: 'Plating & Pass Counter',
    isObstacle: true,
    interactionPoints: [{ x: 10, y: 7 }, { x: 12, y: 7 }],
  },
  {
    id: 'bar_drinks',
    type: 'drink_station',
    x: 9,
    y: 2,
    width: 2,
    height: 1,
    rotation: 0,
    name: 'Mixology & Espresso Bar',
    isObstacle: true,
    interactionPoints: [{ x: 9, y: 3 }, { x: 10, y: 3 }],
  },
  {
    id: 'kitchen_sink',
    type: 'sink_dishwasher',
    x: 13,
    y: 12,
    width: 1,
    height: 2,
    rotation: 0,
    name: 'Deep Wash Sink',
    isObstacle: true,
    interactionPoints: [{ x: 12, y: 12 }, { x: 12, y: 13 }],
  },
  // Decor & Plants
  {
    id: 'decor_p1',
    type: 'decor_plant',
    x: 1,
    y: 2,
    width: 1,
    height: 1,
    rotation: 0,
    name: 'Monstera Plant',
    isObstacle: true,
    interactionPoints: [],
  },
  {
    id: 'decor_p2',
    type: 'decor_plant',
    x: 1,
    y: 12,
    width: 1,
    height: 1,
    rotation: 0,
    name: 'Fiddle Leaf Fig',
    isObstacle: true,
    interactionPoints: [],
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff_host_1',
    name: 'Sophia Laurent',
    role: 'host',
    avatar: {
      skinColor: '#f7d0b3',
      hairColor: '#3a2012',
      hairStyle: 'long',
      shirtColor: '#1e293b',
      pantsColor: '#0f172a',
    },
    stats: { speed: 7, cooking: 3, charisma: 9, stamina: 8, cleanliness: 7 },
    energy: 100,
    wagePerHour: 16,
    state: 'idle',
    pos: { x: 4, y: 3 },
    tablesServedCount: 0,
    tipsEarned: 0,
  },
  {
    id: 'staff_waiter_1',
    name: 'Marco Rossi',
    role: 'waiter',
    avatar: {
      skinColor: '#e0ac69',
      hairColor: '#171717',
      hairStyle: 'short',
      shirtColor: '#f8fafc',
      pantsColor: '#1e293b',
    },
    stats: { speed: 8, cooking: 4, charisma: 9, stamina: 9, cleanliness: 8 },
    energy: 100,
    wagePerHour: 18,
    state: 'idle',
    pos: { x: 6, y: 5 },
    tablesServedCount: 0,
    tipsEarned: 0,
  },
  {
    id: 'staff_chef_1',
    name: 'Chef Antoine',
    role: 'chef',
    avatar: {
      skinColor: '#f1c27d',
      hairColor: '#ffffff',
      hairStyle: 'chef_hat',
      shirtColor: '#ffffff',
      pantsColor: '#334155',
      hatColor: '#ffffff',
    },
    stats: { speed: 7, cooking: 10, charisma: 6, stamina: 9, cleanliness: 8 },
    energy: 100,
    wagePerHour: 26,
    state: 'idle',
    pos: { x: 12, y: 7 },
    tablesServedCount: 0,
    tipsEarned: 0,
  },
  {
    id: 'staff_busser_1',
    name: 'Leo Chen',
    role: 'busser',
    avatar: {
      skinColor: '#ffd1a4',
      hairColor: '#1c1917',
      hairStyle: 'short',
      shirtColor: '#475569',
      pantsColor: '#1e293b',
    },
    stats: { speed: 9, cooking: 2, charisma: 6, stamina: 9, cleanliness: 10 },
    energy: 100,
    wagePerHour: 15,
    state: 'idle',
    pos: { x: 12, y: 11 },
    tablesServedCount: 0,
    tipsEarned: 0,
  }
];

export class RestaurantSimulation {
  public gridWidth = 16;
  public gridHeight = 16;
  public tiles: TileType[][] = [];
  public objects: PlacedObject[] = [];
  public staff: StaffMember[] = [];
  public guests: GuestEntity[] = [];
  public tickets: OrderTicket[] = [];
  public menu: MenuItem[] = [];
  public reviews: GuestReview[] = [];
  public stats: RestaurantStats = {
    cash: 1250,
    dailyRevenue: 0,
    dailyExpenses: 0,
    dailyCustomersServed: 0,
    dailyCustomersLost: 0,
    reputationStars: 4.7,
    totalGuestsServedAllTime: 0,
    totalIncomeAllTime: 0,
  };
  public aiSettings: AIPolicySettings = {
    enabled: true,
    mode: 'balanced',
    autoRestockIngredients: true,
    autoReassignStaffRoles: true,
    autoAdjustPrices: true,
    autoHireWhenQueuesLong: true,
    autoCleanTablesUrgent: true,
    targetProfitMarginPct: 65,
  };
  public gameSpeed: number = 1.0;
  public isPaused: boolean = false;
  public day: number = 1;
  public timeOfDaySeconds: number = 11 * 3600; // starts at 11:00 AM (40% lunch rush)
  public pathfinder: AStarPathfinder;

  private spawnTimer: number = 0;
  private spawnInterval: number = 7.0; // guest party every 7s
  private notifications: string[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.initGrid();
    this.objects = JSON.parse(JSON.stringify(INITIAL_OBJECTS));
    this.staff = JSON.parse(JSON.stringify(INITIAL_STAFF));
    this.menu = JSON.parse(JSON.stringify(INITIAL_MENU));
    this.pathfinder = new AStarPathfinder(this.gridWidth, this.gridHeight, this.getCollisionGrid());
    this.loadFromStorage();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private initGrid() {
    this.tiles = [];
    for (let y = 0; y < this.gridHeight; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        if (x === 0 || y === 0 || x === this.gridWidth - 1 || y === this.gridHeight - 1) {
          // Perimeter walls with door at entrance (x: 2, y: 15)
          if (x === 2 && y === 15) {
            row.push('door_in');
          } else {
            row.push('wall');
          }
        } else if (x >= 11) {
          row.push('floor_kitchen');
        } else {
          row.push('floor_wood');
        }
      }
      this.tiles.push(row);
    }
  }

  public getCollisionGrid(): boolean[][] {
    const grid: boolean[][] = [];
    for (let y = 0; y < this.gridHeight; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        const isWall = this.tiles[y]?.[x] === 'wall';
        let hasObstacle = false;
        for (const obj of this.objects) {
          if (obj.isObstacle && x >= obj.x && x < obj.x + obj.width && y >= obj.y && y < obj.y + obj.height) {
            hasObstacle = true;
            break;
          }
        }
        row.push(isWall || hasObstacle);
      }
      grid.push(row);
    }
    return grid;
  }

  public updateCollisionGrid() {
    this.pathfinder.updateCollisionGrid(this.getCollisionGrid());
  }

  public update(deltaMs: number) {
    if (this.isPaused) return;

    const deltaSec = (deltaMs / 1000) * this.gameSpeed;

    // Progress time of day
    this.timeOfDaySeconds += deltaSec * 30; // 1 real sec = 30 in-game seconds
    if (this.timeOfDaySeconds >= 23 * 3600) {
      // 11:00 PM close -> Next day reset
      this.timeOfDaySeconds = 11 * 3600;
      this.day += 1;
      this.stats.dailyRevenue = 0;
      this.stats.dailyExpenses = 0;
      this.stats.dailyCustomersServed = 0;
      this.stats.dailyCustomersLost = 0;
      this.addNotification(`☀️ Day ${this.day} begins! Restaurant opened for service.`);
      soundEngine.playFanfare();
    }

    // AI Director evaluation
    const aiResult = aiDirector.evaluateAndDirect(
      deltaSec,
      this.aiSettings,
      this.staff,
      this.guests,
      this.tickets,
      this.objects,
      this.menu,
      this.stats.cash,
      (cost) => {
        this.stats.cash -= cost;
        this.stats.dailyExpenses += cost;
      },
      (role) => {
        this.hireAutoStaff(role);
      }
    );

    for (const notif of aiResult.notifications) {
      this.addNotification(notif);
    }

    // Spawn Guests
    this.updateGuestSpawning(deltaSec);

    // Update Guests state machine
    this.updateGuests(deltaSec);

    // Update Staff state machine & tasks
    this.updateStaff(deltaSec);

    // Update Kitchen cooking progress
    this.updateKitchenCooking(deltaSec);
  }

  private updateGuestSpawning(deltaSec: number) {
    this.spawnTimer += deltaSec;
    const currentGuests = this.guests.filter(g => g.state !== 'exited');
    const availableSeats = this.objects
      .filter(o => o.type.startsWith('table') && !o.isOccupied && (o.dirtyPlates || 0) === 0)
      .length;

    // Modulate spawn rate based on AI policy and current restaurant capacity
    let interval = this.spawnInterval;
    if (this.aiSettings.mode === 'aggressive_marketing') interval = 4.5;
    if (this.aiSettings.mode === 'vip_luxury') interval = 9.0;

    if (this.spawnTimer >= interval && currentGuests.length < 12) {
      this.spawnTimer = 0;
      this.spawnNewGuest();
    }
  }

  private spawnNewGuest() {
    const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Mia', 'Ethan', 'Chloe', 'Oliver', 'Sofia', 'Leo', 'Zoe', 'Alexander', 'Maya'];
    const randomName = names[Math.floor(Math.random() * names.length)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '.';
    const skinColors = ['#f7d0b3', '#e0ac69', '#f1c27d', '#ffd1a4', '#8d5524', '#c68642'];
    const hairColors = ['#171717', '#3a2012', '#d97706', '#92400e', '#e2e8f0'];
    const shirtColors = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

    const guest: GuestEntity = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: randomName,
      avatar: {
        skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        hairStyle: ['short', 'long', 'curly', 'ponytail'][Math.floor(Math.random() * 4)] as AvatarAppearance['hairStyle'],
        shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
        pantsColor: '#1e293b',
        glasses: Math.random() < 0.25,
      },
      state: 'arriving',
      pos: { x: 2, y: 15 }, // Entrance
      targetPos: { x: 3, y: 3 }, // Waiting area near host
      path: [],
      patience: 100,
      maxPatience: 60, // 60 seconds
      hunger: Math.floor(Math.random() * 4) + 6,
      budget: Math.floor(Math.random() * 35) + 25,
      happiness: 100,
      favoriteCategory: ['main', 'appetizer', 'drink', 'dessert'][Math.floor(Math.random() * 4)] as MenuItem['category'],
      eatingProgress: 0,
      thought: 'Looking for a great meal!',
      moodEmoji: '😊',
      waitTime: 0,
    };

    // Calculate path to host area
    if (guest.targetPos) {
      guest.path = this.pathfinder.findPath(guest.pos, guest.targetPos, false);
    }
    this.guests.push(guest);
    soundEngine.playGuestEnter();
  }

  private updateGuests(deltaSec: number) {
    for (const guest of this.guests) {
      if (guest.state === 'exited') continue;

      guest.waitTime += deltaSec;

      // Handle walking along path
      if (guest.path && guest.path.length > 0) {
        // Move towards next node
        const nextNode = guest.path[0];
        guest.pos = { x: nextNode.x, y: nextNode.y };
        guest.path.shift();
      }

      // Guest State Transitions
      switch (guest.state) {
        case 'arriving':
          if (!guest.path || guest.path.length === 0) {
            guest.state = 'waiting_queue';
            guest.thought = 'Waiting to be seated by the host...';
          }
          break;

        case 'waiting_queue':
          // Drain patience while waiting in line
          guest.patience -= (deltaSec / guest.maxPatience) * 100;
          if (guest.patience < 50) guest.moodEmoji = '😐';
          if (guest.patience < 25) guest.moodEmoji = '😠';

          if (guest.patience <= 0) {
            this.handleGuestAngryLeave(guest, 'Wait was too long at the door.');
          }
          break;

        case 'moving_to_table':
          if (!guest.path || guest.path.length === 0) {
            guest.state = 'seated_menu';
            guest.thought = 'Browsing the delicious menu...';
            guest.moodEmoji = '📖';
            guest.patience = 100; // Reset patience for dining phase
          }
          break;

        case 'seated_menu':
          // Peruse menu for 3 seconds then signal ready to order
          guest.patience -= (deltaSec / 35) * 100;
          if (guest.waitTime % 3.0 < deltaSec) {
            guest.state = 'ready_to_order';
            guest.thought = 'Ready to order! Looking for waiter...';
            guest.moodEmoji = '🙋';
          }
          break;

        case 'ready_to_order':
          guest.patience -= (deltaSec / 45) * 100;
          if (guest.patience <= 0) {
            this.handleGuestAngryLeave(guest, 'No waiter came to take my order!');
          }
          break;

        case 'waiting_food':
          guest.patience -= (deltaSec / 60) * 100;
          if (guest.patience < 40) {
            guest.thought = 'Food is taking a while...';
            guest.moodEmoji = '⏳';
          }
          if (guest.patience <= 0) {
            this.handleGuestAngryLeave(guest, 'Food never arrived from the kitchen!');
          }
          break;

        case 'eating':
          guest.eatingProgress += (deltaSec / 5.0) * 100; // 5 seconds eating
          guest.moodEmoji = '😋';
          guest.thought = 'This tastes incredible!';
          if (guest.eatingProgress >= 100) {
            guest.state = 'ready_to_pay';
            guest.thought = 'Ready for the bill, please.';
            guest.moodEmoji = '💳';
          }
          break;

        case 'ready_to_pay':
          // Waiter will collect bill automatically
          break;

        case 'paid_leaving':
        case 'angry_leaving':
          const isPaid = guest.state === 'paid_leaving';
          if (!guest.path || guest.path.length === 0) {
            guest.state = 'exited';
            // Free assigned table if any
            if (guest.assignedTableId) {
              const table = this.objects.find(o => o.id === guest.assignedTableId);
              if (table) {
                table.isOccupied = false;
                table.assignedGuestIds = [];
                if (isPaid) {
                  table.dirtyPlates = (table.dirtyPlates || 0) + 1;
                }
              }
            }
          }
          break;
      }
    }
  }

  private handleGuestAngryLeave(guest: GuestEntity, reason: string) {
    guest.state = 'angry_leaving';
    guest.moodEmoji = '😡';
    guest.thought = reason;
    this.stats.dailyCustomersLost += 1;
    soundEngine.playAngryLeave();

    this.reviews.unshift({
      id: `rev_${Date.now()}`,
      guestName: guest.name,
      stars: 1,
      comment: reason,
      timestamp: 'Just now',
      tipAmount: 0,
    });
    this.recalculateReputation();

    // Walk to exit
    guest.path = this.pathfinder.findPath(guest.pos, { x: 2, y: 15 }, true);
  }

  private updateStaff(deltaSec: number) {
    for (const member of this.staff) {
      // Handle movement
      if (member.path && member.path.length > 0) {
        member.pos = { x: member.path[0].x, y: member.path[0].y };
        member.path.shift();
      }

      // Role AI Dispatching
      switch (member.role) {
        case 'host':
          this.handleHostBehavior(member, deltaSec);
          break;
        case 'waiter':
          this.handleWaiterBehavior(member, deltaSec);
          break;
        case 'chef':
          this.handleChefBehavior(member, deltaSec);
          break;
        case 'busser':
          this.handleBusserBehavior(member, deltaSec);
          break;
        case 'bartender':
        case 'manager':
          // Cross-trained to assist anywhere
          this.handleWaiterBehavior(member, deltaSec);
          break;
      }
    }
  }

  private handleHostBehavior(host: StaffMember, _deltaSec: number) {
    if (host.state !== 'idle') return;

    // Find first queued guest
    const queuedGuest = this.guests.find(g => g.state === 'waiting_queue');
    if (!queuedGuest) return;

    // Find available clean table
    const cleanTable = this.objects.find(
      o => o.type.startsWith('table') && !o.isOccupied && (o.dirtyPlates || 0) === 0
    );

    if (cleanTable && cleanTable.seatPositions && cleanTable.seatPositions.length > 0) {
      // Seat guest
      cleanTable.isOccupied = true;
      cleanTable.assignedGuestIds = [queuedGuest.id];
      queuedGuest.assignedTableId = cleanTable.id;
      queuedGuest.assignedSeatPos = cleanTable.seatPositions[0];
      queuedGuest.state = 'moving_to_table';
      queuedGuest.path = this.pathfinder.findPath(queuedGuest.pos, queuedGuest.assignedSeatPos, true);
      queuedGuest.thought = `Seated at ${cleanTable.name}!`;

      // Host greeting emote
      host.state = 'idle';
      soundEngine.playBell();
    }
  }

  private handleWaiterBehavior(waiter: StaffMember, _deltaSec: number) {
    if (waiter.state !== 'idle') return;

    // 1. Priority A: Deliver cooked food waiting at pickup counter
    const readyTicket = this.tickets.find(t => t.status === 'cooked_ready');
    if (readyTicket) {
      const guest = this.guests.find(g => g.id === readyTicket.guestId);
      if (guest && guest.assignedSeatPos) {
        readyTicket.status = 'served';
        waiter.state = 'serving_food';
        waiter.carriedItem = { type: 'food', menuItem: readyTicket.menuItem };
        waiter.path = this.pathfinder.findPath(waiter.pos, guest.assignedSeatPos, true);

        // After reaching table
        setTimeout(() => {
          waiter.state = 'idle';
          waiter.carriedItem = undefined;
          if (guest.state === 'waiting_food') {
            guest.state = 'eating';
            guest.eatingProgress = 0;
            soundEngine.playSizzle();
          }
        }, 1200 / this.gameSpeed);
        return;
      }
    }

    // 2. Priority B: Collect payment from ready_to_pay guests
    const payingGuest = this.guests.find(g => g.state === 'ready_to_pay');
    if (payingGuest && payingGuest.assignedSeatPos) {
      waiter.state = 'walking';
      waiter.path = this.pathfinder.findPath(waiter.pos, payingGuest.assignedSeatPos, true);

      setTimeout(() => {
        this.processPaymentAndCheckout(payingGuest, waiter);
        waiter.state = 'idle';
      }, 1000 / this.gameSpeed);
      return;
    }

    // 3. Priority C: Take order from ready_to_order guests
    const orderingGuest = this.guests.find(g => g.state === 'ready_to_order');
    if (orderingGuest && orderingGuest.assignedSeatPos && orderingGuest.assignedTableId) {
      waiter.state = 'taking_order';
      waiter.carriedItem = { type: 'notepad' };
      waiter.path = this.pathfinder.findPath(waiter.pos, orderingGuest.assignedSeatPos, true);

      setTimeout(() => {
        this.takeGuestOrder(orderingGuest, waiter);
        waiter.state = 'idle';
        waiter.carriedItem = undefined;
      }, 1200 / this.gameSpeed);
      return;
    }

    // 4. Priority D: Bus dirty tables if no busser is present
    const dirtyTable = this.objects.find(o => o.type.startsWith('table') && (o.dirtyPlates || 0) > 0 && !o.inUseByStaffId);
    const hasBusser = this.staff.some(s => s.role === 'busser');
    if (dirtyTable && !hasBusser && dirtyTable.interactionPoints.length > 0) {
      dirtyTable.inUseByStaffId = waiter.id;
      waiter.state = 'bussing_table';
      waiter.path = this.pathfinder.findPath(waiter.pos, dirtyTable.interactionPoints[0], true);

      setTimeout(() => {
        dirtyTable.dirtyPlates = 0;
        dirtyTable.inUseByStaffId = undefined;
        waiter.state = 'idle';
        soundEngine.playDishClatter();
      }, 1500 / this.gameSpeed);
    }
  }

  private takeGuestOrder(guest: GuestEntity, _waiter: StaffMember) {
    // Pick unlocked dish (prefer favorite category)
    const available = this.menu.filter(m => m.unlocked);
    const categoryMatches = available.filter(m => m.category === guest.favoriteCategory);
    const chosenDish = categoryMatches.length > 0
      ? categoryMatches[Math.floor(Math.random() * categoryMatches.length)]
      : available[Math.floor(Math.random() * available.length)] || INITIAL_MENU[0];

    const ticket: OrderTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      guestId: guest.id,
      guestName: guest.name,
      tableId: guest.assignedTableId || '',
      seatIndex: 0,
      menuItemId: chosenDish.id,
      menuItem: chosenDish,
      status: 'ordered',
      createdAt: Date.now(),
      prepProgress: 0,
    };

    guest.orderedTicket = ticket;
    guest.state = 'waiting_food';
    guest.thought = `Ordered ${chosenDish.name}! Hope it comes fast.`;
    guest.moodEmoji = chosenDish.iconEmoji;
    this.tickets.push(ticket);

    // Subtract ingredient food cost
    this.stats.cash -= chosenDish.costToMake;
    this.stats.dailyExpenses += chosenDish.costToMake;

    soundEngine.playBell();
  }

  private handleChefBehavior(chef: StaffMember, _deltaSec: number) {
    if (chef.state !== 'idle') return;

    // Find pending ordered ticket
    const pendingTicket = this.tickets.find(t => t.status === 'ordered' && !t.assignedChefId);
    if (!pendingTicket) return;

    // Find required kitchen station
    const station = this.objects.find(
      o => o.type === pendingTicket.menuItem.prepStation && !o.inUseByStaffId
    );

    if (station && station.interactionPoints.length > 0) {
      pendingTicket.assignedChefId = chef.id;
      pendingTicket.status = 'cooking';
      station.inUseByStaffId = chef.id;
      chef.state = 'cooking';
      chef.currentTicketId = pendingTicket.id;
      chef.path = this.pathfinder.findPath(chef.pos, station.interactionPoints[0], true);
      soundEngine.playSizzle();
    }
  }

  private updateKitchenCooking(deltaSec: number) {
    for (const ticket of this.tickets) {
      if (ticket.status === 'cooking') {
        const chef = this.staff.find(s => s.id === ticket.assignedChefId);
        const cookingSkill = chef ? (chef.stats.cooking / 10) : 1.0;
        const totalDuration = ticket.menuItem.prepTimeSeconds / cookingSkill;

        ticket.prepProgress += (deltaSec / totalDuration) * 100;

        if (ticket.prepProgress >= 100) {
          ticket.prepProgress = 100;
          ticket.status = 'cooked_ready';

          // Release cooking station & chef
          const station = this.objects.find(o => o.inUseByStaffId === chef?.id);
          if (station) station.inUseByStaffId = undefined;

          if (chef) {
            chef.state = 'idle';
            chef.currentTicketId = undefined;
          }
          soundEngine.playBell();
        }
      }
    }
  }

  private handleBusserBehavior(busser: StaffMember, _deltaSec: number) {
    if (busser.state !== 'idle') return;

    // Find dirty table
    const dirtyTable = this.objects.find(
      o => o.type.startsWith('table') && (o.dirtyPlates || 0) > 0 && !o.inUseByStaffId
    );

    if (dirtyTable && dirtyTable.interactionPoints.length > 0) {
      dirtyTable.inUseByStaffId = busser.id;
      busser.state = 'bussing_table';
      busser.path = this.pathfinder.findPath(busser.pos, dirtyTable.interactionPoints[0], true);

      setTimeout(() => {
        dirtyTable.dirtyPlates = 0;
        dirtyTable.inUseByStaffId = undefined;
        busser.state = 'washing_dishes';
        busser.carriedItem = { type: 'dirty_dishes' };

        // Take dishes to sink
        const sink = this.objects.find(o => o.type === 'sink_dishwasher');
        if (sink && sink.interactionPoints.length > 0) {
          busser.path = this.pathfinder.findPath(busser.pos, sink.interactionPoints[0], true);
          setTimeout(() => {
            busser.state = 'idle';
            busser.carriedItem = undefined;
            soundEngine.playDishClatter();
          }, 1500 / this.gameSpeed);
        } else {
          busser.state = 'idle';
          busser.carriedItem = undefined;
        }
      }, 1500 / this.gameSpeed);
    }
  }

  private processPaymentAndCheckout(guest: GuestEntity, waiter: StaffMember) {
    const ticket = guest.orderedTicket;
    if (!ticket) return;

    const dishPrice = ticket.menuItem.sellPrice;
    // Calculate tip based on waiter charisma + guest happiness
    const tipPct = Math.max(0.1, (waiter.stats.charisma / 10) * 0.2 + (guest.happiness / 100) * 0.15);
    const tipAmount = +(dishPrice * tipPct).toFixed(2);
    const totalPaid = +(dishPrice + tipAmount).toFixed(2);

    this.stats.cash += totalPaid;
    this.stats.dailyRevenue += totalPaid;
    this.stats.dailyCustomersServed += 1;
    this.stats.totalGuestsServedAllTime += 1;
    this.stats.totalIncomeAllTime += totalPaid;

    waiter.tablesServedCount += 1;
    waiter.tipsEarned += tipAmount;

    soundEngine.playCoin();

    // Generate Review
    const stars = guest.happiness > 80 ? 5 : guest.happiness > 50 ? 4 : 3;
    const comments = [
      `The ${ticket.menuItem.name} was sublime! Outstanding service from ${waiter.name}.`,
      `Very tasty food and fast turnaround! Will definitely come back.`,
      `Great ambiance and hot, fresh food delivered right on time.`,
      `Lovely dining experience, 5/5 stars for the kitchen staff!`,
    ];
    this.reviews.unshift({
      id: `rev_${Date.now()}`,
      guestName: guest.name,
      stars: stars,
      comment: comments[Math.floor(Math.random() * comments.length)],
      foodServed: ticket.menuItem.name,
      timestamp: 'Just now',
      tipAmount: tipAmount,
    });
    this.recalculateReputation();

    // Guest leaves happily
    guest.state = 'paid_leaving';
    guest.moodEmoji = '💰';
    guest.thought = `Paid $${totalPaid} with tip. Fantastic!`;
    guest.path = this.pathfinder.findPath(guest.pos, { x: 2, y: 15 }, true);
  }

  private recalculateReputation() {
    if (this.reviews.length === 0) return;
    const recent = this.reviews.slice(0, 15);
    const avg = recent.reduce((sum, r) => sum + r.stars, 0) / recent.length;
    this.stats.reputationStars = +avg.toFixed(1);
  }

  public hireAutoStaff(role: RoleType) {
    const names = ['Jordan Lee', 'Taylor Swift', 'Sam Rivera', 'Morgan Vance', 'Casey Bell'];
    const newStaff: StaffMember = {
      id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: names[Math.floor(Math.random() * names.length)],
      role: role,
      avatar: {
        skinColor: '#f7d0b3',
        hairColor: '#3a2012',
        hairStyle: role === 'chef' ? 'chef_hat' : 'short',
        shirtColor: role === 'chef' ? '#ffffff' : '#3b82f6',
        pantsColor: '#1e293b',
        hatColor: role === 'chef' ? '#ffffff' : undefined,
      },
      stats: { speed: 8, cooking: role === 'chef' ? 9 : 5, charisma: 8, stamina: 8, cleanliness: 8 },
      energy: 100,
      wagePerHour: role === 'chef' ? 24 : 16,
      state: 'idle',
      pos: { x: 8, y: 8 },
      tablesServedCount: 0,
      tipsEarned: 0,
    };
    this.staff.push(newStaff);
  }

  public addNotification(msg: string) {
    this.notifications.unshift(msg);
    if (this.notifications.length > 20) this.notifications.pop();
    this.notifyListeners();
  }

  public getNotifications(): string[] {
    return this.notifications;
  }

  public saveToStorage() {
    const state = {
      restaurantName: 'ChefAI Bistro',
      day: this.day,
      timeOfDay: this.timeOfDaySeconds,
      stats: this.stats,
      staff: this.staff,
      menu: this.menu,
      objects: this.objects,
      aiSettings: this.aiSettings,
      reviews: this.reviews,
    };
    localStorage.setItem('chefai_saved_game', JSON.stringify(state));
  }

  public loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem('chefai_saved_game');
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (state.stats) this.stats = state.stats;
      if (state.staff) this.staff = state.staff;
      if (state.menu) this.menu = state.menu;
      if (state.objects) this.objects = state.objects;
      if (state.aiSettings) this.aiSettings = state.aiSettings;
      if (state.reviews) this.reviews = state.reviews;
      if (state.day) this.day = state.day;
      return true;
    } catch {
      return false;
    }
  }

  public resetToDefault() {
    localStorage.removeItem('chefai_saved_game');
    this.objects = JSON.parse(JSON.stringify(INITIAL_OBJECTS));
    this.staff = JSON.parse(JSON.stringify(INITIAL_STAFF));
    this.menu = JSON.parse(JSON.stringify(INITIAL_MENU));
    this.guests = [];
    this.tickets = [];
    this.reviews = [];
    this.stats = {
      cash: 1250,
      dailyRevenue: 0,
      dailyExpenses: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
      reputationStars: 4.8,
      totalGuestsServedAllTime: 0,
      totalIncomeAllTime: 0,
    };
    this.day = 1;
    this.timeOfDaySeconds = 11 * 3600;
    this.updateCollisionGrid();
    this.notifyListeners();
  }
}

export const simulation = new RestaurantSimulation();
