import React from 'react';
import Icon from './Icon';
import OfflineIndicator from './OfflineIndicator';
import { NavItem } from '../types';

interface HeaderProps {
  setActiveTab: (tab: NavItem) => void;
  unreadCount: number;
  onNotificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setActiveTab, unreadCount, onNotificationClick }) => {
  return (
    <header className="bg-white p-4 flex justify-between items-center z-10 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-black tracking-tighter">
          <span className="text-black">Udyam</span>
          <span className="text-gray-500">X</span>
        </h1>
        <OfflineIndicator />
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onNotificationClick} className="relative text-gray-500">
            <i className="fa-solid fa-bell text-xl"></i>
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadCount}
                </span>
            )}
        </button>
        <button onClick={() => setActiveTab('profile')} className="text-gray-500">
          <Icon icon="user" className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
};

export default Header;