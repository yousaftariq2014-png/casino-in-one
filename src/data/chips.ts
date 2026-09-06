import { ChipConfig } from '../types';

export const CHIP_DENOMINATIONS: ChipConfig[] = [
  {
    value: 10,
    label: '$10',
    color: 'bg-slate-100 text-slate-900',
    borderColor: 'border-blue-600',
    accentColor: '#2563eb',
  },
  {
    value: 25,
    label: '$25',
    color: 'bg-emerald-600 text-white',
    borderColor: 'border-emerald-200',
    accentColor: '#10b981',
  },
  {
    value: 50,
    label: '$50',
    color: 'bg-blue-600 text-white',
    borderColor: 'border-blue-200',
    accentColor: '#3b82f6',
  },
  {
    value: 100,
    label: '$100',
    color: 'bg-zinc-900 text-amber-400',
    borderColor: 'border-amber-400',
    accentColor: '#f59e0b',
  },
  {
    value: 500,
    label: '$500',
    color: 'bg-purple-700 text-white',
    borderColor: 'border-purple-200',
    accentColor: '#a855f7',
  },
  {
    value: 1000,
    label: '$1K',
    color: 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 font-black',
    borderColor: 'border-amber-700',
    accentColor: '#eab308',
  },
  {
    value: 5000,
    label: '$5K',
    color: 'bg-gradient-to-tr from-rose-700 to-red-500 text-white font-black',
    borderColor: 'border-rose-300',
    accentColor: '#f43f5e',
  },
];
