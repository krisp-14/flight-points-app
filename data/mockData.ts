/**
 * Mock data for pointsaway application
 * This data powers the UI until real API integration
 */

import type {
  User,
  Destination,
  FlightResult,
  RecentSearch,
  CategoryFilter,
  NavItem,
  QuickStat,
  DateOption,
} from '@/types';

// ============================================================================
// User Data
// ============================================================================

export const mockUser: User = {
  id: 'user-1',
  name: 'Kris',
  email: 'kris@example.com',
  totalPoints: 385420,
  pointsBreakdown: [
    { programId: 1, programName: 'Amex Membership Rewards', points: 125000, programLogo: '/logos/amex.svg' },
    { programId: 2, programName: 'Chase Ultimate Rewards', points: 98500, programLogo: '/logos/chase.svg' },
    { programId: 3, programName: 'Aeroplan', points: 75420, programLogo: '/logos/aeroplan.svg' },
    { programId: 4, programName: 'Avios', points: 45000, programLogo: '/logos/avios.svg' },
    { programId: 5, programName: 'United MileagePlus', points: 41500, programLogo: '/logos/united.svg' },
  ],
};

// ============================================================================
// Navigation Items
// ============================================================================

export const navItems: NavItem[] = [
  { label: 'Search', href: '/', icon: 'Search' },
  { label: 'Explore', href: '/explore', icon: 'Compass' },
];

// ============================================================================
// Category Filters
// ============================================================================

export const categoryFilters: CategoryFilter[] = [
  { id: 'anywhere', label: 'Anywhere', emoji: '🌍' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'city', label: 'City', emoji: '🏙️' },
  { id: 'nature', label: 'Nature', emoji: '🌲' },
];

// ============================================================================
// Destinations (for Explore Page)
// ============================================================================

export const destinations: Destination[] = [
  {
    id: 'dest-1',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
    category: ['city', 'culture', 'beach'],
    tags: ['Popular', 'Award sweet spot'],
    route: 'YYZ → BCN',
    fromPoints: 45000,
    retailPrice: 1250,
    loyaltyProgram: 'Aeroplan',
    description: 'Explore Gaudí architecture and Mediterranean beaches',
    featured: true,
  },
  {
    id: 'dest-2',
    city: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    category: ['city', 'culture'],
    tags: ['Trending', 'Business class deal'],
    route: 'YYZ → NRT',
    fromPoints: 85000,
    retailPrice: 3200,
    loyaltyProgram: 'United MileagePlus',
    description: 'Modern metropolis meets ancient traditions',
    featured: true,
  },
  {
    id: 'dest-3',
    city: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    category: ['beach', 'nature', 'adventure'],
    tags: ['Award sweet spot'],
    route: 'YYZ → DPS',
    fromPoints: 62000,
    retailPrice: 1850,
    loyaltyProgram: 'Avios',
    description: 'Tropical paradise with temples and rice terraces',
  },
  {
    id: 'dest-4',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    category: ['city', 'culture'],
    tags: ['Popular', 'First class available'],
    route: 'YYZ → CDG',
    fromPoints: 50000,
    retailPrice: 1450,
    loyaltyProgram: 'Aeroplan',
    description: 'The City of Light and world-class cuisine',
    featured: true,
  },
  {
    id: 'dest-5',
    city: 'Iceland',
    country: 'Iceland',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1504829857797-ddff29c27f1d?w=800&q=80',
    category: ['nature', 'adventure'],
    tags: ['Trending'],
    route: 'YYZ → KEF',
    fromPoints: 35000,
    retailPrice: 950,
    loyaltyProgram: 'Avios',
    description: 'Northern lights, glaciers, and geothermal wonders',
  },
  {
    id: 'dest-6',
    city: 'Maldives',
    country: 'Maldives',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    category: ['beach', 'nature'],
    tags: ['Business class deal', 'Luxury'],
    route: 'YYZ → MLE',
    fromPoints: 95000,
    retailPrice: 4200,
    loyaltyProgram: 'Amex MR',
    description: 'Overwater villas and pristine coral reefs',
  },
  {
    id: 'dest-7',
    city: 'New York',
    country: 'USA',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    category: ['city'],
    tags: ['Popular', 'Award sweet spot'],
    route: 'YYZ → JFK',
    fromPoints: 12500,
    retailPrice: 450,
    loyaltyProgram: 'Aeroplan',
    description: 'The city that never sleeps',
  },
  {
    id: 'dest-8',
    city: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    category: ['beach', 'culture'],
    tags: ['Trending', 'Romantic'],
    route: 'YYZ → JTR',
    fromPoints: 55000,
    retailPrice: 1650,
    loyaltyProgram: 'United MileagePlus',
    description: 'White-washed villages and sunset views',
  },
  {
    id: 'dest-9',
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    category: ['city', 'adventure'],
    tags: ['First class available', 'Luxury'],
    route: 'YYZ → DXB',
    fromPoints: 78000,
    retailPrice: 2800,
    loyaltyProgram: 'Avios',
    description: 'Futuristic skyline and desert adventures',
  },
  {
    id: 'dest-10',
    city: 'Maui',
    country: 'USA',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    category: ['beach', 'nature', 'adventure'],
    tags: ['Popular', 'Award sweet spot'],
    route: 'YYZ → OGG',
    fromPoints: 35000,
    retailPrice: 950,
    loyaltyProgram: 'United MileagePlus',
    description: 'Volcanic landscapes and world-class beaches',
  },
  {
    id: 'dest-11',
    city: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    category: ['city', 'culture'],
    tags: ['Popular', 'Business class deal'],
    route: 'YYZ → LHR',
    fromPoints: 60000,
    retailPrice: 1850,
    loyaltyProgram: 'Avios',
    description: 'Historic landmarks and modern culture',
  },
  {
    id: 'dest-12',
    city: 'Costa Rica',
    country: 'Costa Rica',
    region: 'Central America',
    imageUrl: 'https://images.unsplash.com/photo-1621473184847-9c6b8e537f32?w=800&q=80',
    category: ['nature', 'adventure', 'beach'],
    tags: ['Trending', 'Eco-tourism'],
    route: 'YYZ → SJO',
    fromPoints: 28000,
    retailPrice: 750,
    loyaltyProgram: 'Aeroplan',
    description: 'Rainforests, wildlife, and Pacific beaches',
  },
];

// ============================================================================
// Flight Results (for Search Results Page)
// ============================================================================

export const flightResults: FlightResult[] = [
  {
    id: 'flight-1',
    segments: [
      {
        airline: 'Air Canada',
        airlineLogo: '/logos/air-canada.svg',
        flightNumber: 'AC 848',
        origin: 'YYZ',
        destination: 'BCN',
        departureTime: '17:30',
        arrivalTime: '07:15+1',
        duration: '7h 45m',
        aircraft: 'Boeing 787-9',
      },
    ],
    totalDuration: '7h 45m',
    stops: 0,
    pointsCost: 45000,
    retailPrice: 1250,
    loyaltyProgram: 'Aeroplan',
    loyaltyProgramLogo: '/logos/aeroplan.svg',
    isGreatDeal: true,
    specialOffer: '15% transfer bonus from Amex',
    availability: 'high',
  },
  {
    id: 'flight-2',
    segments: [
      {
        airline: 'Lufthansa',
        airlineLogo: '/logos/lufthansa.svg',
        flightNumber: 'LH 472',
        origin: 'YYZ',
        destination: 'FRA',
        departureTime: '19:20',
        arrivalTime: '09:05+1',
        duration: '7h 45m',
      },
      {
        airline: 'Lufthansa',
        airlineLogo: '/logos/lufthansa.svg',
        flightNumber: 'LH 1134',
        origin: 'FRA',
        destination: 'BCN',
        departureTime: '11:30',
        arrivalTime: '13:45',
        duration: '2h 15m',
      },
    ],
    totalDuration: '12h 25m',
    stops: 1,
    pointsCost: 42000,
    retailPrice: 1250,
    loyaltyProgram: 'Avianca LifeMiles',
    loyaltyProgramLogo: '/logos/lifemiles.svg',
    isGreatDeal: false,
    availability: 'medium',
  },
  {
    id: 'flight-3',
    segments: [
      {
        airline: 'British Airways',
        airlineLogo: '/logos/british-airways.svg',
        flightNumber: 'BA 94',
        origin: 'YYZ',
        destination: 'LHR',
        departureTime: '20:40',
        arrivalTime: '08:30+1',
        duration: '6h 50m',
      },
      {
        airline: 'British Airways',
        airlineLogo: '/logos/british-airways.svg',
        flightNumber: 'BA 478',
        origin: 'LHR',
        destination: 'BCN',
        departureTime: '14:50',
        arrivalTime: '18:10',
        duration: '2h 20m',
      },
    ],
    totalDuration: '15h 30m',
    stops: 1,
    pointsCost: 38000,
    retailPrice: 1250,
    loyaltyProgram: 'British Airways Avios',
    loyaltyProgramLogo: '/logos/avios.svg',
    isGreatDeal: true,
    availability: 'low',
  },
  {
    id: 'flight-4',
    segments: [
      {
        airline: 'Air Canada',
        airlineLogo: '/logos/air-canada.svg',
        flightNumber: 'AC 848',
        origin: 'YYZ',
        destination: 'BCN',
        departureTime: '17:30',
        arrivalTime: '07:15+1',
        duration: '7h 45m',
        aircraft: 'Boeing 787-9',
      },
    ],
    totalDuration: '7h 45m',
    stops: 0,
    pointsCost: 75000,
    retailPrice: 3850,
    loyaltyProgram: 'Aeroplan (Business)',
    loyaltyProgramLogo: '/logos/aeroplan.svg',
    isGreatDeal: false,
    specialOffer: 'Lie-flat seats, premium dining',
    availability: 'medium',
  },
  {
    id: 'flight-5',
    segments: [
      {
        airline: 'United Airlines',
        airlineLogo: '/logos/united.svg',
        flightNumber: 'UA 58',
        origin: 'YYZ',
        destination: 'EWR',
        departureTime: '15:00',
        arrivalTime: '17:15',
        duration: '1h 15m',
      },
      {
        airline: 'TAP Air Portugal',
        airlineLogo: '/logos/tap.svg',
        flightNumber: 'TP 204',
        origin: 'EWR',
        destination: 'LIS',
        departureTime: '22:55',
        arrivalTime: '10:45+1',
        duration: '6h 50m',
      },
      {
        airline: 'TAP Air Portugal',
        airlineLogo: '/logos/tap.svg',
        flightNumber: 'TP 1042',
        origin: 'LIS',
        destination: 'BCN',
        departureTime: '15:20',
        arrivalTime: '18:30',
        duration: '2h 10m',
      },
    ],
    totalDuration: '21h 30m',
    stops: 2,
    pointsCost: 35000,
    retailPrice: 1250,
    loyaltyProgram: 'United MileagePlus',
    loyaltyProgramLogo: '/logos/united.svg',
    isGreatDeal: false,
    availability: 'high',
  },
];

// ============================================================================
// Recent Searches
// ============================================================================

export const recentSearches: RecentSearch[] = [
  {
    id: 'search-1',
    searchParams: {
      origin: 'YYZ',
      destination: 'BCN',
      departureDate: '2025-03-15',
      passengers: 2,
      cabinClass: 'economy',
      tripType: 'round-trip',
    },
    timestamp: '2025-01-15T14:30:00Z',
    resultCount: 12,
  },
  {
    id: 'search-2',
    searchParams: {
      origin: 'YYZ',
      destination: 'NRT',
      departureDate: '2025-04-20',
      passengers: 1,
      cabinClass: 'business',
      tripType: 'one-way',
    },
    timestamp: '2025-01-14T10:15:00Z',
    resultCount: 8,
  },
  {
    id: 'search-3',
    searchParams: {
      origin: 'YYZ',
      destination: 'CDG',
      departureDate: '2025-05-10',
      returnDate: '2025-05-20',
      passengers: 2,
      cabinClass: 'premium-economy',
      tripType: 'round-trip',
    },
    timestamp: '2025-01-13T16:45:00Z',
    resultCount: 15,
  },
];

// ============================================================================
// Date Options (for Search Results Page)
// ============================================================================

export const dateOptions: DateOption[] = [
  { date: '2025-03-13', displayDate: 'Wed, Mar 13', price: 48000, available: true },
  { date: '2025-03-14', displayDate: 'Thu, Mar 14', price: 45000, available: true },
  { date: '2025-03-15', displayDate: 'Fri, Mar 15', price: 45000, available: true },
  { date: '2025-03-16', displayDate: 'Sat, Mar 16', price: 52000, available: true },
  { date: '2025-03-17', displayDate: 'Sun, Mar 17', price: 55000, available: true },
  { date: '2025-03-18', displayDate: 'Mon, Mar 18', price: 42000, available: true },
  { date: '2025-03-19', displayDate: 'Tue, Mar 19', price: 40000, available: false },
];

// ============================================================================
// Quick Stats (for Search Results Page)
// ============================================================================

export const quickStats: QuickStat[] = [
  {
    id: 'stat-1',
    label: 'pointsaway pick',
    value: '45,000 pts',
    subtitle: 'Best value • Direct flight',
    variant: 'featured',
  },
  {
    id: 'stat-2',
    label: 'Fewest points',
    value: '35,000 pts',
    subtitle: '2 stops • 21h 30m',
    variant: 'default',
  },
  {
    id: 'stat-3',
    label: 'Quickest',
    value: '7h 45m',
    subtitle: '45,000 pts • Direct',
    variant: 'default',
  },
];

