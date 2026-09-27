export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹ INR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($ USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€ EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£ GBP)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
];

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  id: string; // Unique internal profile ID (independent from username)
  username: string; // Unique username (e.g. adarsh01) used for profile identification
  name: string; // Display name (e.g. Adarsh Pandey)
  avatarColor: string;
  currency: CurrencyCode;
  theme: ThemeMode;
  residenceLabel?: string; // e.g. "Hostel Block B, Room 304" or "Campus Hall"
  collegeName?: string; // e.g. "College of Engineering"
  semester?: string; // e.g. "Semester 3"
  createdAt: string; // ISO date string
  lastActiveAt: string; // ISO date string
}

export interface ProfileMetaState {
  activeProfileId: string | null;
  profiles: UserProfile[];
  version: number;
}
