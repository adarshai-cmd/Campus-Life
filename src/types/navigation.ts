export type NavigationSectionId =
  | 'dashboard'
  | 'college'
  | 'money'
  | 'travel'
  | 'skills'
  | 'settings';

export interface NavItemConfig {
  id: NavigationSectionId;
  label: string;
  href: string;
  badge?: string;
  description: string;
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    description: 'Daily overview, quick actions, and status',
  },
  {
    id: 'college',
    label: 'College',
    href: '/college',
    description: 'Attendance, timetable, assignments & CGPA',
  },
  {
    id: 'money',
    label: 'Money',
    href: '/money',
    description: 'Hostel budget, mess bills, roommate splits & expenses',
  },
  {
    id: 'travel',
    label: 'Travel',
    href: '/travel',
    description: 'Home trips, transit tickets & packing lists',
  },
  {
    id: 'skills',
    label: 'Skills',
    href: '/skills',
    description: 'Self-study tracker, projects & certifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    description: 'Preferences, profile switching & local storage backup',
  },
];
