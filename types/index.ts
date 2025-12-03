/**
 * Central type definitions for pointsaway application
 * These types support the new design components and pages
 */

// ============================================================================
// User & Profile Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalPoints: number;
  pointsBreakdown: PointsBalance[];
}

export interface PointsBalance {
  programId: number;
  programName: string;
  points: number;
  programLogo?: string;
}

// ============================================================================
// Search & Flight Types
// ============================================================================

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  searchWithPoints?: boolean;
}

export interface RecentSearch {
  id: string;
  searchParams: SearchParams;
  timestamp: string;
  resultCount: number;
}

export interface FlightSegment {
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft?: string;
}

export interface FlightResult {
  id: string;
  segments: FlightSegment[];
  totalDuration: string;
  stops: number;
  pointsCost: number;
  retailPrice: number;
  loyaltyProgram: string;
  loyaltyProgramLogo: string;
  isGreatDeal?: boolean;
  specialOffer?: string;
  availability: 'high' | 'medium' | 'low';
}

// ============================================================================
// Destination & Explore Types
// ============================================================================

export type DestinationCategory =
  | 'anywhere'
  | 'beach'
  | 'culture'
  | 'adventure'
  | 'city'
  | 'nature';

export interface Destination {
  id: string;
  city: string;
  country: string;
  region: string;
  imageUrl: string;
  category: DestinationCategory[];
  tags: string[];
  route: string; // e.g., "YYZ → BCN"
  fromPoints: number; // Starting from this many points
  retailPrice: number;
  loyaltyProgram: string;
  description?: string;
  featured?: boolean;
}

export interface CategoryFilter {
  id: DestinationCategory;
  label: string;
  emoji: string;
}

// ============================================================================
// Navigation & UI Types
// ============================================================================

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  variant?: 'default' | 'highlight';
};

export interface QuickStat {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  variant: 'featured' | 'default';
}

// ============================================================================
// Filter & Sort Types
// ============================================================================

export type SortOption =
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'duration-short'
  | 'duration-long'
  | 'departure-early'
  | 'departure-late';

export interface FilterState {
  programs: string[];
  airlines: string[];
  maxStops: number;
  maxDuration?: number;
  cabinClass: string[];
}

// ============================================================================
// Date Selection Types
// ============================================================================

export interface DateOption {
  date: string; // ISO date string
  displayDate: string; // "Mon, Dec 25"
  price: number;
  available: boolean;
}
