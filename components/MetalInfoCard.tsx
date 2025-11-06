'use client';

import { useState } from 'react';

interface MetalInfo {
  id: string;
  name: string;
  symbol: string;
  category: 'primary' | 'additional';
  description: string;
  uses: string[];
  rarity: 'common' | 'rare' | 'very-rare' | 'extremely-rare';
  priceRange: string;
}

const METAL_INFO: MetalInfo[] = [
  {
    id: 'gold',
    name: 'Gold',
    symbol: '🥇',
    category: 'primary',
    description: 'A precious metal that has been valued for centuries as a store of wealth and symbol of prosperity.',
    uses: ['Jewelry', 'Investment', 'Electronics', 'Dentistry', 'Medicine'],
    rarity: 'common',
    priceRange: '$1,800 - $2,200 per ounce'
  },
  {
    id: 'silver',
    name: 'Silver',
    symbol: '🥈',
    category: 'primary',
    description: 'The most electrically conductive element, widely used in industrial applications and as an investment.',
    uses: ['Electronics', 'Solar panels', 'Jewelry', 'Investment', 'Medical devices'],
    rarity: 'common',
    priceRange: '$20 - $30 per ounce'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    symbol: '⚪',
    category: 'primary',
    description: 'A dense, malleable, and highly unreactive precious metal, primarily used in automotive catalysts.',
    uses: ['Automotive catalysts', 'Jewelry', 'Investment', 'Medical devices', 'Chemical industry'],
    rarity: 'rare',
    priceRange: '$900 - $1,200 per ounce'
  },
  {
    id: 'palladium',
    name: 'Palladium',
    symbol: '⚙️',
    category: 'primary',
    description: 'A rare and lustrous silvery-white metal, primarily used in catalytic converters and electronics.',
    uses: ['Catalytic converters', 'Electronics', 'Dentistry', 'Jewelry', 'Hydrogen purification'],
    rarity: 'rare',
    priceRange: '$1,000 - $3,000 per ounce'
  },
  {
    id: 'rhodium',
    name: 'Rhodium',
    symbol: '💎',
    category: 'additional',
    description: 'One of the rarest and most valuable precious metals, known for its reflective properties and corrosion resistance.',
    uses: ['Catalytic converters', 'Jewelry plating', 'Electrical contacts', 'Chemical industry'],
    rarity: 'extremely-rare',
    priceRange: '$2,000 - $6,000 per ounce'
  },
  {
    id: 'iridium',
    name: 'Iridium',
    symbol: '🔷',
    category: 'additional',
    description: 'The second-densest metal, extremely corrosion-resistant and used in high-performance applications.',
    uses: ['Spark plugs', 'Crucibles', 'Electrical contacts', 'Medical devices', 'Satellite equipment'],
    rarity: 'very-rare',
    priceRange: '$1,200 - $2,500 per ounce'
  },
  {
    id: 'ruthenium',
    name: 'Ruthenium',
    symbol: '🔶',
    category: 'additional',
    description: 'A hard, white metal that is part of the platinum group, used to harden platinum and palladium.',
    uses: ['Electronics', 'Catalysts', 'Jewelry alloys', 'Solar cells', 'Chemical industry'],
    rarity: 'very-rare',
    priceRange: '$300 - $600 per ounce'
  },
  {
    id: 'osmium',
    name: 'Osmium',
    symbol: '🔷',
    category: 'additional',
    description: 'The densest naturally occurring element, blue-white in color, and extremely hard and brittle.',
    uses: ['Fountain pen tips', 'Instrument pivots', 'Electrical contacts', 'Specialized alloys'],
    rarity: 'rare',
    priceRange: '$400 - $800 per ounce'
  }
];

export default function MetalInfoCard({ metalId }: { metalId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const metalInfo = METAL_INFO.find(metal => metal.id === metalId);
  
  if (!metalInfo) return null;

  const rarityColors = {
    'common': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'rare': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'very-rare': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'extremely-rare': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="text-3xl mr-4">{metalInfo.symbol}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {metalInfo.name}
            </h3>
            <div className="flex items-center mt-1">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full mr-2 ${rarityColors[metalInfo.rarity]}`}>
                {metalInfo.rarity.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {metalInfo.category === 'primary' ? 'Primary' : 'Additional'}
              </span>
            </div>
          </div>
        </div>
        <span className="text-gray-500 dark:text-gray-400">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {metalInfo.description}
          </p>
          
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Common Uses</h4>
            <ul className="grid grid-cols-2 gap-2">
              {metalInfo.uses.map((use, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-primary-500 mr-2">•</span>
                  {use}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Typical Price Range:</span> {metalInfo.priceRange}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}