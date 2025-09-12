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
    { 
        crop: 'Corn', 
        price: 15.50, 
        change: 0.05, 
        lastUpdated: '2h ago',
        history: [
            { date: 'Jan', price: 14.8 },
            { date: 'Feb', price: 15.1 },
            { date: 'Mar', price: 15.0 },
            { date: 'Apr', price: 15.3 },
            { date: 'May', price: 15.6 },
            { date: 'Jun', price: 15.5 },
        ]
    },
    { 
        crop: 'Soybeans', 
        price: 32.75, 
        change: -0.12, 
        lastUpdated: '1h ago',
        history: [
            { date: 'Jan', price: 31.5 },
            { date: 'Feb', price: 32.8 },
            { date: 'Mar', price: 32.2 },
            { date: 'Apr', price: 32.1 },
            { date: 'May', price: 32.5 },
            { date: 'Jun', price: 32.75 },
        ]
    },
    { 
        crop: 'Wheat', 
        price: 22.20, 
        change: 0.25, 
        lastUpdated: '3h ago',
        history: [
            { date: 'Jan', price: 21.0 },
            { date: 'Feb', price: 21.5 },
            { date: 'Mar', price: 21.9 },
            { date: 'Apr', price: 22.1 },
            { date: 'May', price: 21.8 },
            { date: 'Jun', price: 22.20 },
        ]
    },
    { 
        crop: 'Grapes', 
        price: 1.50, 
        change: 0.02, 
        lastUpdated: '4h ago',
        history: [
            { date: 'Jan', price: 1.40 },
            { date: 'Feb', price: 1.42 },
            { date: 'Mar', price: 1.45 },
            { date: 'Apr', price: 1.48 },
            { date: 'May', price: 1.52 },
            { date: 'Jun', price: 1.50 },
        ]
     },
    { 
        crop: 'Lettuce', 
        price: 0.80, 
        change: -0.05, 
        lastUpdated: '1h ago',
        history: [
            { date: 'Jan', price: 0.75 },
            { date: 'Feb', price: 0.78 },
            { date: 'Mar', price: 0.82 },
            { date: 'Apr', price: 0.85 },
            { date: 'May', price: 0.83 },
            { date: 'Jun', price: 0.80 },
        ]
    },
];
