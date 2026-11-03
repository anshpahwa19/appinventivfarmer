import type { KisaniDidi, Profile } from '@/types';

/** Sample people for the prototype. Phone numbers are placeholders, not real contacts. */
export const DEFAULT_PROFILE: Profile = {
  name: 'Ram Prasad Yadav',
  username: 'ram.prasad',
  phone: '9876543210',
  village: 'Ratanpur',
  taluka: 'Buldhana',
  district: 'Buldhana',
  state: 'Maharashtra',
  pincode: '443001',
  memberSince: '2024-06-12',
};

export const KISANI_DIDI: KisaniDidi = {
  name: 'Sumita Kumari',
  phone: '9000000001',
  area: 'Ratanpur cluster',
  languages: ['Marathi', 'Hindi'],
};

export const SUPPORT = {
  phone: '18000000000',
  phoneLabel: '1800 000 0000',
  whatsapp: '9000000002',
  email: 'support@kisaniurjaa.example',
  hours: 'Mon–Sat, 9 AM – 6 PM',
};

/** Registered village coordinates, used for weather when location is not shared. */
export const HOME_COORDS = { latitude: 20.53, longitude: 76.18, label: 'Ratanpur, Buldhana' };
