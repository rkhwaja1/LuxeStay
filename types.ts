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

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  name?: string;
}