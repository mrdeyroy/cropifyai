import type { Farm, MarketPrice, User } from './types';

export const user: User = {
  name: 'Alex Green',
  email: 'alex.green@cropify.ai',
  avatar: '/avatars/01.png',
};

export const farms: Farm[] = [
  {
    id: 'farm-001',
    name: "Green Valley Organics",
    location: "Napa Valley, CA",
    soilType: "Loam",
    ph: 6.8,
    moisture: 35,
    nutrients: {
      nitrogen: 120,
      phosphorus: 50,
      potassium: 80,
    },
  },
  {
    id: 'farm-002',
    name: "Sunrise Meadows",
    location: "Ames, IA",
    soilType: "Silty Clay",
    ph: 7.2,
    moisture: 45,
    nutrients: {
      nitrogen: 150,
      phosphorus: 65,
      potassium: 100,
    },
  },
  {
    id: 'farm-003',
    name: "Golden Plains",
    location: "Hereford, TX",
    soilType: "Sandy Loam",
    ph: 6.5,
    moisture: 25,
    nutrients: {
      nitrogen: 100,
      phosphorus: 40,
      potassium: 70,
    },
  },
];

export const marketPrices: MarketPrice[] = [
    { crop: 'Corn', price: 4.50, change: 0.05, lastUpdated: '2h ago' },
    { crop: 'Soybeans', price: 11.75, change: -0.12, lastUpdated: '1h ago' },
    { crop: 'Wheat', price: 6.20, change: 0.25, lastUpdated: '3h ago' },
    { crop: 'Grapes', price: 1.50, change: 0.02, lastUpdated: '4h ago' },
    { crop: 'Lettuce', price: 0.80, change: -0.05, lastUpdated: '1h ago' },
];
