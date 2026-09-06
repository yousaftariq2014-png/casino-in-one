import { ChipConfig } from '../types';

export const CHIP_DENOMINATIONS: ChipConfig[] = [
  {
    value: 10,
    label: '$10',
    color: 'bg-slate-200 text-slate-900',
    borderColor: 'border-slate-400',
    accentColor: '#94a3b8',
  },
  {
    value: 25,
    label: '$25',
    color: 'bg-emerald-600 text-white',
    borderColor: 'border-emerald-300',
    accentColor: '#10b981',
  },
  {
    value: 50,
    label: '$50',
    color: 'bg-red-600 text-white',
    borderColor: 'border-red-300',
    accentColor: '#ef4444',
  },
  {
    value: 100,
    label: '$100',
    color: 'bg-slate-900 text-amber-300',
    borderColor: 'border-amber-400',
    accentColor: '#d4af37',
  },
  {
    value: 500,
    label: '$500',
    color: 'bg-purple-700 text-white',
    borderColor: 'border-purple-300',
    accentColor: '#a855f7',
  },
  {
    value: 1000,
    label: '$1K',
    color: 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 text-slate-950 font-black',
    borderColor: 'border-yellow-200',
    accentColor: '#eab308',
  },
  {
    value: 5000,
    label: '$5K',
    color: 'bg-gradient-to-tr from-amber-200 via-slate-100 to-amber-300 text-slate-950 font-black',
    borderColor: 'border-amber-400',
    accentColor: '#f59e0b',
  },
];
