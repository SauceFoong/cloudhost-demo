/**
 * Cloud Server Products
 */
export interface ServerProduct {
  id: string;
  name: string;
  description: string;
  cpu: string;
  ram: string;
  storage: string;
  bandwidth: string;
  price: number;
  currency: string;
  icon: string;
}

export const SERVER_PRODUCTS: ServerProduct[] = [
  {
    id: 'prod_basic_001',
    name: 'Starter',
    description: 'Perfect for small projects',
    cpu: '1 vCPU',
    ram: '1 GB',
    storage: '25 GB SSD',
    bandwidth: '1 TB',
    price: 5,
    currency: 'USD',
    icon: '🚀',
  },
  {
    id: 'prod_standard_002',
    name: 'Standard',
    description: 'Great for production',
    cpu: '2 vCPU',
    ram: '4 GB',
    storage: '80 GB SSD',
    bandwidth: '4 TB',
    price: 20,
    currency: 'USD',
    icon: '⚡',
  },
  {
    id: 'prod_pro_003',
    name: 'Professional',
    description: 'High performance',
    cpu: '4 vCPU',
    ram: '8 GB',
    storage: '160 GB SSD',
    bandwidth: '8 TB',
    price: 40,
    currency: 'USD',
    icon: '🔥',
  },
  {
    id: 'prod_enterprise_004',
    name: 'Enterprise',
    description: 'Maximum power',
    cpu: '8 vCPU',
    ram: '32 GB',
    storage: '320 GB SSD',
    bandwidth: 'Unlimited',
    price: 160,
    currency: 'USD',
    icon: '💎',
  },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
] as const;
