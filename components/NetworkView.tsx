import React, { useState } from 'react';
import { Business } from '../types';
import { useI18n } from '../i18n';

const initialBusinesses: Business[] = [
  { id: '1', name: 'Creative Prints Co.', category: 'Printing Services', distance: '0.5 km away', avatarUrl: 'https://picsum.photos/seed/1/200' },
  { id: '2', name: 'The Daily Grind Cafe', category: 'Cafe & Bakery', distance: '0.8 km away', avatarUrl: 'https://picsum.photos/seed/2/200' },
  { id: '3', name: 'Green Leaf Organics', category: 'Grocery Store', distance: '1.2 km away', avatarUrl: 'https://picsum.photos/seed/3/200' },
  { id: '4', name: 'Bytes & Mortar Web', category: 'IT Services', distance: '2.5 km away', avatarUrl: 'https://picsum.photos/seed/4/200' },
];

const BusinessCard: React.FC<{ business: Business }> = ({ business }) => {
    const { t } = useI18n();
    return (
        <div className="bg-white p-4 rounded-3xl shadow-sm flex items-center space-x-4">
            <img src={business.avatarUrl} alt={business.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
            <div className="flex-grow">
                <p className="font-bold text-black">{business.name}</p>
                <p className="text-sm text-[#0a2540] font-medium">{business.category}</p>
                <p className="text-xs text-gray-500">{business.distance}</p>
            </div>
            <button className="bg-gray-200 text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-300 transition">
                {t('network.message')}
            </button>
        </div>
    );
}

const NetworkView: React.FC = () => {
  const { t } = useI18n();
  const [businesses] = useState<Business[]>(initialBusinesses);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">{t('network.title')}</h2>

      <div className="relative">
        <input
            type="search"
            placeholder={t('network.searchPlaceholder')}
            className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0a2540] bg-white text-black"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fa-solid fa-search text-gray-400"></i>
        </div>
      </div>

      <div className="space-y-3">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} />
        ))}
      </div>
    </div>
  );
};

export default NetworkView;