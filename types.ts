export type UserRole = 'GUEST' | 'PROVIDER' | 'HOTEL';

export interface ServiceCategory {
  id: string;
  name: string;
  image: string;
  availableCount: number;
  slug: string;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  title: string;
  providerName: string;
  price: number;
  priceUnit: 'guest' | 'group' | 'session' | 'hour';
  rating: number;
  reviewCount: number;
  image: string;
  isPopular?: boolean;
}

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isProfileComplete: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  providerName: string;
  date: string;
  time: string;
  notes: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED';
  timestamp: number;
}