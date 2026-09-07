export interface ChipPackage {
  id: string;
  name: string;
  priceUsd: number;
  chips: number;
  bonusChips: number;
  badge?: string;
  isPopular?: boolean;
  color: string;
}

export const CHIP_PACKAGES: ChipPackage[] = [
  {
    id: 'starter',
    name: 'Starter Bundle',
    priceUsd: 5,
    chips: 50000,
    bonusChips: 5000,
    badge: 'Quick Play',
    color: 'from-amber-600/20 to-amber-500/10',
  },
  {
    id: 'pro',
    name: 'High Roller Pack',
    priceUsd: 20,
    chips: 250000,
    bonusChips: 35000,
    badge: 'Most Popular',
    isPopular: true,
    color: 'from-amber-500/30 to-yellow-500/20',
  },
  {
    id: 'vip',
    name: 'Gold VIP Pass',
    priceUsd: 50,
    chips: 750000,
    bonusChips: 150000,
    badge: '+20% Extra',
    color: 'from-yellow-500/30 to-amber-600/20',
  },
  {
    id: 'royale',
    name: 'Royale Executive',
    priceUsd: 100,
    chips: 2000000,
    bonusChips: 500000,
    badge: 'VIP #1 Choice',
    color: 'from-amber-400/30 to-emerald-500/20',
  },
  {
    id: 'whale',
    name: 'Emperor Whale Tier',
    priceUsd: 250,
    chips: 6500000,
    bonusChips: 2000000,
    badge: 'Maximum Chips',
    color: 'from-yellow-400/40 via-amber-500/30 to-rose-500/20',
  },
];
