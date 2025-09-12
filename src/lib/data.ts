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
    location: "Nashik, Maharashtra",
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
    location: "Ludhiana, Punjab",
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
    location: "Anantapur, Andhra Pradesh",
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
        price: 1400, 
        change: 50, 
        lastUpdated: '2h ago',
        history: [
            { date: 'Jan', price: 1380 },
            { date: 'Feb', price: 1410 },
            { date: 'Mar', price: 1400 },
            { date: 'Apr', price: 1430 },
            { date: 'May', price: 1460 },
            { date: 'Jun', price: 1400 },
        ]
    },
    { 
        crop: 'Soybeans', 
        price: 3500, 
        change: -120, 
        lastUpdated: '1h ago',
        history: [
            { date: 'Jan', price: 3450 },
            { date: 'Feb', price: 3580 },
            { date: 'Mar', price: 3520 },
            { date: 'Apr', price: 3510 },
            { date: 'May', price: 3550 },
            { date: 'Jun', price: 3500 },
        ]
    },
    { 
        crop: 'Wheat', 
        price: 2200, 
        change: 250, 
        lastUpdated: '3h ago',
        history: [
            { date: 'Jan', price: 2100 },
            { date: 'Feb', price: 2150 },
            { date: 'Mar', price: 2190 },
            { date: 'Apr', price: 2210 },
            { date: 'May', price: 2180 },
            { date: 'Jun', price: 2200 },
        ]
    },
    { 
        crop: 'Grapes', 
        price: 80, 
        change: 2, 
        lastUpdated: '4h ago',
        history: [
            { date: 'Jan', price: 78 },
            { date: 'Feb', price: 79 },
            { date: 'Mar', price: 81 },
            { date: 'Apr', price: 82 },
            { date: 'May', price: 83 },
            { date: 'Jun', price: 80 },
        ]
     },
    { 
        crop: 'Lettuce', 
        price: 45, 
        change: -5, 
        lastUpdated: '1h ago',
        history: [
            { date: 'Jan', price: 42 },
            { date: 'Feb', price: 43 },
            { date: 'Mar', price: 46 },
            { date: 'Apr', price: 48 },
            { date: 'May', price: 47 },
            { date: 'Jun', price: 45 },
        ]
    },
];
