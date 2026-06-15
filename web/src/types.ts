export type UserRole =
  | "owner"
  | "admin"
  | "accountant"
  | "user"
  | "seller"
  | "shipping_manager"
  | "delivery_driver";

export type ProductCategory =
  | "electronics"
  | "computers"
  | "books"
  | "clothing"
  | "home-kitchen"
  | "sports-outdoors"
  | "beauty"
  | "toys-games"
  | "grocery"
  | "automotive"
  | "garden"
  | "health"
  | "pet-supplies"
  | "office"
  | "jewelry"
  | "baby"
  | "movies-music"
  | "tools";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  storeName?: string;
}

export interface PhoneOtpRecord {
  phone: string;
  code: string;
  purpose: "register" | "login";
  role?: "user" | "seller";
  createdAt: string;
  expiresAt: number;
}

export type MarketNamePreset = "dordoi" | "madina" | "orto-sai" | "custom";

export interface SellerProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  marketPreset: MarketNamePreset;
  marketCustom?: string;
  storeAddress: string;
  returnAddress: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  /** Seller's purchase / wholesale cost per unit (som). */
  costPrice?: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  rating: number;
  reviewCount: number;
  prime?: boolean;
  sellerId?: string;
  sellerName?: string;
  colors: string[];
  sizes: string[];
  stock?: number;
  discountPercent?: number;
  dimensions?: ProductDimensions;
  categoryAttributes?: Record<string, string | number>;
  postalDropOff?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "ready_for_pickup"
  | "at_warehouse"
  | "assigned"
  | "out_for_delivery"
  | "shipped"
  | "delivered";

export interface ShippingAddress {
  recipientName: string;
  email: string;
  phone: string;
  deliveryZone: "kyrgyzstan" | "almaty";
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
}
export type ReturnStatus = "none" | "requested" | "approved" | "completed";

export interface OrderLineItem {
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  costPrice?: number;
  image: string;
  postalDroppedOff?: boolean;
  returnStatus?: ReturnStatus;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderLineItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  shippingMethod?: "standard" | "express";
  assignedDriverId?: string;
  assignedDriverName?: string;
  /** 6-digit code for receiver — generated when driver is assigned */
  deliveryOtp?: string;
  deliveryOtpGeneratedAt?: string;
  deliveredAt?: string;
  deliveryConfirmedRecipientName?: string;
  shippingNotes?: string;
  updatedAt?: string;
}

export type NotificationType = "return_requested" | "new_order";

export interface SellerNotification {
  id: string;
  sellerId: string;
  type: NotificationType;
  orderId: string;
  productId: string;
  productName: string;
  customerName: string;
  read: boolean;
  createdAt: string;
}

export interface OwnerSettings {
  phone: string;
}

export interface OtpRecord {
  code: string;
  phone: string;
  createdAt: string;
  expiresAt: number;
}

export interface SellerBilling {
  sellerId: string;
  yearlySubscriptionPaid: boolean;
  yearlySubscriptionAmount: number;
  yearlySubscriptionDate: string;
  photoshootItemCount: number;
  itemQuantity: number;
  photoshootScheduledAt: string;
  notes?: string;
  updatedAt: string;
}

export const ALL_CATEGORIES: ProductCategory[] = [
  "electronics",
  "computers",
  "books",
  "clothing",
  "home-kitchen",
  "sports-outdoors",
  "beauty",
  "toys-games",
  "grocery",
  "automotive",
  "garden",
  "health",
  "pet-supplies",
  "office",
  "jewelry",
  "baby",
  "movies-music",
  "tools",
];
