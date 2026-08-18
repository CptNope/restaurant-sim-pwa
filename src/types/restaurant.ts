// Complete Type Definitions for Restaurant Simulator

export type RoleType = 'host' | 'waiter' | 'chef' | 'busser' | 'bartender' | 'manager';

export type GuestState = 
  | 'arriving'
  | 'waiting_queue'
  | 'moving_to_table'
  | 'seated_menu'
  | 'ready_to_order'
  | 'order_taken'
  | 'waiting_food'
  | 'eating'
  | 'ready_to_pay'
  | 'paid_leaving'
  | 'angry_leaving'
  | 'exited';

export type StaffState =
  | 'idle'
  | 'walking'
  | 'greeting_guest'
  | 'seating_guest'
  | 'taking_order'
  | 'cooking'
  | 'plating'
  | 'serving_food'
  | 'bussing_table'
  | 'washing_dishes'
  | 'managing_stock'
  | 'taking_break';

export type TileType = 'floor_wood' | 'floor_tile' | 'floor_carpet' | 'floor_kitchen' | 'wall' | 'door_in' | 'door_out';

export type StationType =
  | 'host_stand'
  | 'table_2p'
  | 'table_4p'
  | 'bar_counter'
  | 'prep_counter'
  | 'stove_grill'
  | 'pizza_oven'
  | 'fryer'
  | 'drink_station'
  | 'pickup_counter'
  | 'sink_dishwasher'
  | 'trash_bin'
  | 'storage_fridge'
  | 'decor_plant'
  | 'decor_neon'
  | 'decor_rug';

export interface GridPos {
  x: number;
  y: number;
}

export interface PlacedObject {
  id: string;
  type: StationType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  name: string;
  isObstacle: boolean;
  interactionPoints: GridPos[]; // accessible neighbor tiles
  seatPositions?: GridPos[];    // for tables
  isOccupied?: boolean;
  assignedGuestIds?: string[];
  dirtyPlates?: number;
  inUseByStaffId?: string;
  cookingProgress?: number; // 0 to 100
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'appetizer' | 'main' | 'dessert' | 'drink';
  prepStation: 'prep_counter' | 'stove_grill' | 'pizza_oven' | 'fryer' | 'drink_station';
  prepTimeSeconds: number;
  costToMake: number;
  sellPrice: number;
  popularity: number; // 1 - 10
  qualityRating: number; // 1 - 5
  unlocked: boolean;
  iconColor: string;
  iconEmoji: string;
  description: string;
}

export interface OrderTicket {
  id: string;
  guestId: string;
  guestName: string;
  tableId: string;
  seatIndex: number;
  menuItemId: string;
  menuItem: MenuItem;
  status: 'ordered' | 'cooking' | 'cooked_ready' | 'served' | 'cancelled';
  createdAt: number;
  prepProgress: number; // 0 to 100
  assignedChefId?: string;
  assignedWaiterId?: string;
}

export interface AvatarAppearance {
  skinColor: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'curly' | 'bald' | 'ponytail' | 'chef_hat';
  shirtColor: string;
  pantsColor: string;
  hatColor?: string;
  glasses?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: RoleType;
  avatar: AvatarAppearance;
  stats: {
    speed: number;      // 1-10 -> movement velocity
    cooking: number;    // 1-10 -> prep speed
    charisma: number;   // 1-10 -> customer tip boost
    stamina: number;    // 1-10 -> energy drain resistance
    cleanliness: number;// 1-10 -> bus / wash speed
  };
  energy: number;       // 0 - 100
  wagePerHour: number;
  state: StaffState;
  pos: GridPos;
  targetPos?: GridPos;
  path?: GridPos[];
  currentActionProgress?: number;
  currentTicketId?: string;
  carriedItem?: {
    type: 'food' | 'dirty_dishes' | 'notepad';
    menuItem?: MenuItem;
  };
  assignedStationId?: string;
  tablesServedCount: number;
  tipsEarned: number;
  isPlayerCustomized?: boolean;
}

export interface GuestReview {
  id: string;
  guestName: string;
  stars: number; // 1 - 5
  comment: string;
  foodServed?: string;
  timestamp: string;
  tipAmount: number;
}

export interface GuestEntity {
  id: string;
  name: string;
  avatar: AvatarAppearance;
  state: GuestState;
  pos: GridPos;
  targetPos?: GridPos;
  path?: GridPos[];
  assignedTableId?: string;
  assignedSeatPos?: GridPos;
  orderedTicket?: OrderTicket;
  patience: number;      // 0 - 100
  maxPatience: number;   // seconds base
  hunger: number;        // 1 - 10
  budget: number;
  happiness: number;     // 0 - 100
  favoriteCategory: 'appetizer' | 'main' | 'dessert' | 'drink';
  eatingProgress: number;// 0 - 100
  thought: string;
  moodEmoji: string;
  waitTime: number;      // total time in restaurant
}

export type AIPolicyMode = 'balanced' | 'aggressive_marketing' | 'vip_luxury' | 'budget_saver';

export interface AIPolicySettings {
  enabled: boolean;
  mode: AIPolicyMode;
  autoRestockIngredients: boolean;
  autoReassignStaffRoles: boolean;
  autoAdjustPrices: boolean;
  autoHireWhenQueuesLong: boolean;
  autoCleanTablesUrgent: boolean;
  targetProfitMarginPct: number;
}

export interface RestaurantStats {
  cash: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyCustomersServed: number;
  dailyCustomersLost: number;
  reputationStars: number; // 1.0 to 5.0
  totalGuestsServedAllTime: number;
  totalIncomeAllTime: number;
}

export interface RestaurantSaveState {
  version: string;
  restaurantName: string;
  day: number;
  timeOfDay: number; // 0 to 86400 (seconds in day, e.g. 11:00 AM = 39600)
  stats: RestaurantStats;
  staff: StaffMember[];
  menu: MenuItem[];
  gridWidth: number;
  gridHeight: number;
  tiles: TileType[][];
  objects: PlacedObject[];
  aiSettings: AIPolicySettings;
  reviews: GuestReview[];
}
