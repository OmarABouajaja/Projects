// Core data models for Game Store Zarzis - Final Version
// Updated to match the final database schema

export enum UserRole {
  OWNER = 'owner',
  WORKER = 'worker'
}

export enum SessionType {
  HOURLY = 'hourly',
  PER_GAME = 'per_game'
}

export enum ServiceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  WAITING_PARTS = 'waiting_parts',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ServiceCategory {
  PHONE_REPAIR = 'phone_repair',
  CONSOLE_REPAIR = 'console_repair',
  CONTROLLER_REPAIR = 'controller_repair',
  ACCOUNT = 'account',
  ADMIN = 'admin'
}

export enum PaymentType {
  CASH = 'cash',
  POINTS = 'points'
}

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  REFUND = 'refund',
  BONUS = 'bonus',
  ADJUSTMENT = 'adjustment'
}

// Gaming Session system
export interface GameSession {
  id: string;
  console_id: string;
  client_id: string | null;
  pricing_id: string;
  session_type: string;
  start_time: string;
  end_time: string | null;
  games_played: number;
  extra_time_minutes: number;
  base_amount: number;
  extra_amount: number;
  total_amount: number;
  points_earned: number;
  is_free_game: boolean;
  payment_method: string;
  points_used: number;
  status: string;
  staff_id: string;
  notes: string | null;
  created_at?: string;
}

// Console system
export interface Console {
  id: string;
  name: string;
  console_type: string; // 'PS4', 'PS5'
  status: 'available' | 'in_use' | 'maintenance';
  station_number?: number;
  current_session_id?: string;
  shortcut_key?: string;
  default_pricing_id?: string;
  created_at: string;
  updated_at: string;
}

// Staff profiles (from Supabase Auth)
export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User roles for staff
export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  help_tooltips_visible?: boolean;
  created_at: string;
}

// Store Settings
export interface StoreSettings {
  id: string;
  store_name: string;
  sms_enabled: boolean;
  sms_phone?: string;
  free_games_enabled: boolean;
  points_system_enabled: boolean;
  help_tooltips_enabled: boolean;
  tariff_display_mode: 'cards' | 'table' | 'comparison';
  data_limit_mb: number;
  opening_hours: any;
  pricing_config: any;
  auth_config: any;
  delivery_settings?: DeliverySettings;
  default_pricing_ps4?: string;
  default_pricing_ps5?: string;
  updated_at: string;
}

// Client system
export interface Client {
  id: string;
  phone: string;
  name: string;
  email?: string;
  points: number;
  total_spent: number;
  total_games_played: number;
  games_since_free?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Services catalog
export interface ServiceCatalog {
  id: string;
  name: string;
  name_fr: string;
  name_ar: string;
  description?: string;
  description_fr?: string;
  description_ar?: string;
  category: string; // 'phone_repair', 'console_repair', etc.
  price?: number;
  is_complex: boolean;
  estimated_duration?: string;
  image_url?: string; // NEW: Service images
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Product definition
export interface Product {
  id: string;
  name: string;
  name_fr?: string;
  name_ar?: string;
  description?: string;
  description_fr?: string;
  description_ar?: string;
  category: string;
  price: number;
  cost_price?: number;
  cost?: number; // Alternative cost field
  stock_quantity: number;
  stock?: number; // Alternative stock field
  points_earned: number;
  points_price?: number;
  image_url?: string;
  is_active: boolean;

  // NEW: Consumables support
  product_type?: 'physical' | 'consumable' | 'digital';
  subcategory?: string;
  is_quick_sale?: boolean;
  low_stock_threshold?: number;
  digital_content?: string;
  is_digital_delivery?: boolean;
  status?: 'active' | 'out_of_stock' | 'discontinued';

  // Optional/Derived properties for UI
  salePrice?: number; // legacy/mock support
  isOnSale?: boolean; // legacy/mock support

  created_at: string;
  updated_at?: string;
}

// Game Shortcuts (NEW)
export interface GameShortcut {
  id: string;
  name: string;
  console_type: string; // 'ps4', 'ps5'
  icon?: string;
  display_order: number;
  is_active: boolean;
  shortcut_key?: string;
  created_at: string;
  updated_at: string;
}

// Orders (NEW)
export interface Order {
  id: string;
  order_number: string;
  client_id?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;

  // Order details
  items: OrderItem[];
  subtotal: number;

  // Delivery
  delivery_method: 'pickup' | 'rapid_post' | 'local_delivery';
  delivery_cost: number;
  delivery_address?: string;

  total_amount: number;

  // Payment
  payment_method: 'cash' | 'bank_transfer' | 'd17' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference?: string;

  // Status
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

  notes?: string;
  staff_notes?: string;

  staff_id?: string;
  confirmed_at?: string;
  delivered_at?: string;

  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  product_type?: 'physical' | 'consumable' | 'digital';
  digital_content?: string;
}

// Delivery Settings (NEW)
export interface DeliverySettings {
  rapid_post_enabled: boolean;
  local_delivery_enabled: boolean;
  rapid_post_cost: number;
  local_delivery_cost: number;
  delivery_zones: string[];
}

// Expense category enum
export enum ExpenseCategory {
  DAILY = 'daily',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  OTHER = 'other'
}

// Expense definition
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  staff_id: string;
  created_at: string;
  updated_at: string;
}

// Business Analytics Summary
export interface AnalyticsSummary {
  revenue: {
    total: number;
    gaming: number;
    sales: number;
    services: number;
  };
  expenses: {
    total: number;
    daily: number;
    monthly: number;
    yearly: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
}

// Form data types
export interface ClientFormData {
  phone: string;
  name: string;
  points?: number;
}

export interface GameSessionFormData {
  console_id: string;
  client_id?: string;
  pricing_id: string;
  client_name?: string;
  game_name?: string;
}

export interface ServiceRequestFormData {
  service_id: string;
  client_name: string;
  client_phone: string;
  device_type?: string;
  device_brand?: string;
  device_model?: string;
  issue_description: string;
}

// Order Form Data (NEW)
export interface OrderFormData {
  client_name: string;
  client_phone: string;
  client_email?: string;
  total_amount: number;
  items: OrderItem[];
  delivery_method: 'pickup' | 'rapid_post' | 'local_delivery';
  delivery_address?: string;
  payment_method: 'cash' | 'bank_transfer' | 'd17' | 'card';
  payment_reference?: string;
  notes?: string;
}
// Service Requests
export interface ServiceRequest {
  id: string;
  service_id: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  device_type?: string;
  device_brand?: string;
  device_model?: string;
  issue_description: string;
  status: ServiceStatus;
  estimated_cost?: number;
  quoted_price?: number;
  final_cost?: number;
  parts_cost?: number;
  notes?: string;
  staff_id?: string;
  created_at: string;
  updated_at: string;
}

// Blog Posts
export interface BlogPost {
  id: string;
  title: string;
  title_fr?: string;
  title_ar?: string;
  content: string;
  content_fr?: string;
  content_ar?: string;
  excerpt?: string;
  image_url?: string;
  category: string;
  author_id: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Points Transactions
export interface PointsTransaction {
  id: string;
  client_id: string;
  transaction_type: TransactionType;
  amount: number;
  balance_after: number;
  description?: string;
  reference_type?: string; // 'session', 'sale', 'bonus'
  reference_id?: string;
  staff_id?: string;
  confirmed_by_staff: boolean;
  confirmed_by_client: boolean;
  created_at: string;
}

// Sales
export interface Sale {
  id: string;
  client_id?: string;
  total_amount: number;
  payment_method: string;
  staff_id: string;
  created_at: string;
  items?: any[];
}
