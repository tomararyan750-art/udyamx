import React from 'react';
import { NavItem } from '../types';
import Icon from './Icon';
import { useI18n } from '../i18n';

interface BottomNavProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useI18n();

  const navItems: { id: NavItem; labelKey: string }[] = [
    { id: 'dashboard', labelKey: 'nav.home' },
    { id: 'copilot', labelKey: 'nav.copilot' },
    { id: 'invoice', labelKey: 'nav.invoice' },
    { id: 'inventory', labelKey: 'nav.inventory' },
    { id: 'schemes', labelKey: 'nav.schemes' },
    { id: 'loans', labelKey: 'nav.loans' },
    { id: 'network', labelKey: 'nav.network' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-[0_-2px_10px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
              activeTab === item.id ? 'text-[#0a2540]' : 'text-gray-400'
            }`}
          >
            <Icon icon={item.id} className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t(item.labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;