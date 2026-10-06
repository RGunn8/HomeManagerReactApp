// Response and request shapes for the HomeManager Nest API (see /swagger-json).
// The spec does not document most response bodies, so these were taken from live responses.

export type Id = string;

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ApiHomeRoom = {
  id: Id;
  name: string;
  roomEmoji: string | null;
  homeId: Id;
  createdAt: string;
  updatedAt: string;
};

export type ApiRoomSummary = {
  roomId: Id;
  homeId: Id;
  name: string;
  roomEmoji: string | null;
};

export type ApiRoom = ApiRoomSummary & {
  openTasks: number;
  lowStockItems: number;
  itemsTracked: number;
};

export type ApiNote = {
  id: Id;
  content: string;
  roomId: Id;
  createdAt: string;
  updatedAt: string;
};

export type ApiRoomDetail = ApiRoomSummary & {
  notes: ApiNote[];
  projects: number;
  tasks: number;
  inventory: number;
};

export type ApiRoomCreated = ApiRoomSummary & {
  createdAt: string;
  updatedAt: string;
  tasks: ApiTask[];
  inventory: ApiInventoryItem[];
};

export type ApiHome = {
  id: Id;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiHomeWithRooms = ApiHome & {
  rooms: ApiHomeRoom[];
};

export type ApiHomeMember = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'OWNER' | 'MEMBER' | (string & {});
};

export type TaskType = 'CLEANING' | 'MAINTENANCE' | 'PROJECT';
export type TaskStatus = 'TODO' | 'DONE' | 'CANCELLED';
export type RecurrenceFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type ApiTask = {
  id: Id;
  title: string;
  notes: string | null;
  type: TaskType;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceInterval: number;
  homeId: Id;
  roomId: Id | null;
  projectId: Id | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskRequest = {
  title: string;
  notes?: string;
  type: TaskType;
  dueDate?: string;
  recurrenceFrequency: RecurrenceFrequency;
  recurrenceInterval: number;
  roomId?: Id;
  projectId?: Id;
  assigneeId?: string;
};

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'assigneeId' | 'notes'>> & {
  notes?: string | null;
  status?: TaskStatus;
  assigneeId?: string | null;
};

export type ProjectStatusValue = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ApiProject = {
  id: Id;
  name: string;
  description: string | null;
  status: ProjectStatusValue;
  targetCompletionDate: string | null;
  completedDate: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  homeId: Id;
  roomId: Id | null;
  assigneeId: string | null;
  room: { id: Id; name: string } | null;
  tasks: Omit<ApiTask, 'homeId' | 'createdAt' | 'updatedAt'>[];
  materials: ApiProjectMaterial[];
  createdAt: string;
  updatedAt: string;
};

export type ApiProjectMaterial = {
  id: Id;
  name: string;
  quantity: number;
  unitCost: number | null;
  purchased: boolean;
  projectId: Id;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectMaterialRequest = {
  name: string;
  quantity?: number;
  unitCost?: number;
  purchased?: boolean;
};

export type UpdateProjectMaterialRequest = Partial<Omit<CreateProjectMaterialRequest, 'unitCost'>> & {
  unitCost?: number | null;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  status?: ProjectStatusValue;
  estimatedCost?: number;
  actualCost?: number;
  roomId?: Id;
  targetDate?: string;
  assigneeId?: string;
};

export type UpdateProjectRequest = Partial<Omit<CreateProjectRequest, 'assigneeId'>> & {
  assigneeId?: string | null;
};

export type InventoryStatus = 'FULL' | 'HALF' | 'LOW';
export type InventoryTrackingModeValue = 'COUNT' | 'LEVEL' | 'NONE';

export type ApiInventoryItem = {
  id: Id;
  name: string;
  description: string | null;
  category: string;
  quantity: number;
  link: string | null;
  minQuantity: number;
  price: number | null;
  lastPurchaseDate: string | null;
  expiresDate: string | null;
  tags: string[];
  notes: string | null;
  stores: string[];
  trackingMode: InventoryTrackingModeValue;
  homeId: Id;
  roomId: Id | null;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApiInventoryCategory = {
  category: string;
  items: ApiInventoryItem[];
};

export type ApiInventorySuggestion = Pick<ApiInventoryItem, 'id' | 'name' | 'category' | 'quantity' | 'minQuantity'>;

export type CreateInventoryRequest = {
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  minQuantity: number;
  status?: InventoryStatus;
  price?: number;
  tags?: string[];
  link?: string;
  trackingMode?: InventoryTrackingModeValue;
  notes?: string;
  stores?: string[];
  roomId?: Id;
};

export type UpdateInventoryRequest = Partial<Omit<CreateInventoryRequest, 'roomId'>>;

export type ShoppingTripStatus = 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type ShoppingDealType = 'SALE' | 'MULTI_BUY';
export type ShoppingItemStatus = 'PENDING' | 'PARSED' | 'NEEDS_REVIEW' | 'CONFIRMED' | 'APPLIED' | 'REJECTED';

/** `price` is what is paid per item (the sale price for SALE deals); `regularPrice` is the undiscounted price. */
type ShoppingItemPricing = {
  price: number;
  regularPrice: number | null;
  dealType: ShoppingDealType | null;
  multiBuyQuantity: number | null;
  multiBuyPrice: number | null;
};

export type ApiShoppingItem = ShoppingItemPricing & {
  id: Id;
  name: string | null;
  quantity: number | null;
  status: ShoppingItemStatus;
  rawTranscript?: string | null;
  confidence?: number | null;
  lowStockInventoryItemId?: Id | null;
  inventoryItemId?: Id | null;
  shoppingTripId?: Id;
  captureJobId?: Id | null;
};

export type ApiShoppingTrip = {
  id: Id;
  name: string;
  description: string | null;
  runningTotal: number;
  totalCost: number;
  budget: number;
  startDate: string | null;
  completedDate: string | null;
  status: ShoppingTripStatus;
  homeId: Id;
  createdAt: string;
  updatedAt: string;
  items: ApiShoppingItem[];
};

export type ApiShoppingMode = {
  shoppingTripId: Id;
  name: string;
  status: ShoppingTripStatus;
  budgetedAmount: number;
  checkedOffAmount: number;
  remainingBudget: number;
  items: ApiShoppingItem[];
};

export type ApiShoppingCaptureJob = {
  id: Id;
  audioRef: string | null;
  textRef: string | null;
  attempts: number;
  lastError: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  items: ApiShoppingItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateShoppingTripRequest = {
  name: string;
  description?: string;
  budget?: number;
};

export type AddShoppingItemRequest = Partial<ShoppingItemPricing> & {
  name: string;
  quantity: number;
};

export type UpdateCapturedItemRequest = Partial<ShoppingItemPricing> & {
  name?: string;
  quantity?: number;
  status?: ShoppingItemStatus;
};

export type ApiToday = {
  date: string;
  overdue: { total: number; tasks: ApiTodayTask[] };
  today: { total: number; open: number; completed: number; tasks: ApiTodayTask[]; hasMore: boolean };
  projects: {
    id: Id;
    name: string;
    room: string | null;
    dueDate: string | null;
    tasksTotal: number;
    tasksCompleted: number;
    budgetSpent: number | null;
    budgetTotal: number | null;
  }[];
  lowInventory: {
    id: Id;
    name: string;
    quantity: number;
    minQuantity: number;
    trackingMode: InventoryTrackingModeValue;
    belowThresholdBy: number;
  }[];
  shoppingTrips: { id: Id; name: string; pickedItems: number; totalItems: number; items: string[] }[];
};

export type ApiTodayTask = Pick<ApiTask, 'id' | 'title' | 'type' | 'status'> & { dueDate: string | null };
