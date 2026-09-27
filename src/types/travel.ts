export type TravelMode =
  | 'Bus'
  | 'Train'
  | 'Metro'
  | 'Cab'
  | 'Bike'
  | 'Car'
  | 'Flight'
  | 'Walking'
  | 'Other';

export const TRAVEL_MODES: TravelMode[] = [
  'Bus',
  'Train',
  'Metro',
  'Cab',
  'Bike',
  'Car',
  'Flight',
  'Walking',
  'Other',
];

export type TravelSubCategory =
  | 'Transport'
  | 'Stay'
  | 'Food'
  | 'Local Travel'
  | 'Tickets'
  | 'Activities'
  | 'Shopping'
  | 'Other';

export const TRAVEL_SUB_CATEGORIES: TravelSubCategory[] = [
  'Transport',
  'Stay',
  'Food',
  'Local Travel',
  'Tickets',
  'Activities',
  'Shopping',
  'Other',
];

export interface Trip {
  id: string;
  tripName: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  durationDays: number;
  startingLocation: string;
  travelMode: TravelMode;
  distanceKm: number;
  purpose: string;
  plannedBudget: number; // e.g. 10000
  numberOfPeople: number; // e.g. 8 (default 1)
  splitBasis?: 'actual' | 'budget'; // 'actual' = based on total spending, 'budget' = based on planned budget
  notes?: string;
  createdAt: string;
}

export interface TripWithExpenses extends Trip {
  totalCost: number;
  expenseCount: number;
  remainingBudget: number;
  costPerPerson: number;
}

export interface TravelAnalyticsData {
  totalTrips: number;
  tripsThisMonth: number;
  totalTravelSpending: number;
  travelSpendingThisMonth: number;
  averageTripCost: number;
  totalDistanceKm: number;
  upcomingTrip: TripWithExpenses | null;
  mostVisitedDestination: string | null;
  mostExpensiveTrip: { tripName: string; cost: number } | null;
  mostUsedTransport: TravelMode | null;
  monthlySpending: { monthLabel: string; amount: number }[];
}
