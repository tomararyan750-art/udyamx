import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CoPilotChat from './components/CoPilotChat';
import InvoiceGenerator from './components/InvoiceGenerator';
import InventoryManager from './components/InventoryManager';
import NetworkView from './components/NetworkView';
import SchemesView from './components/SchemesView';
import LoanProvidersView from './components/LoanProvidersView';
import ProfileView from './components/ProfileView';
import NotificationsPanel from './components/NotificationsPanel';
import { NavItem, Notification } from './types';
import { useI18n } from './i18n';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotification: Notification = {
        id: new Date().toISOString(),
        title: t('notifications.newScheme.title'),
        message: t('notifications.newScheme.message'),
        read: false,
        link: {
          type: 'tab',
          target: 'schemes',
        },
      };
      setNotifications(prev => [newNotification, ...prev]);
    }, 5000); 

    return () => clearTimeout(timer);
  }, [t]); 

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
      if (notification.link?.type === 'tab') {
          setActiveTab(notification.link.target);
      }
      setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
      setShowNotificationsPanel(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'copilot':
        return <CoPilotChat />;
      case 'invoice':
        return <InvoiceGenerator />;
      case 'inventory':
        return <InventoryManager />;
      case 'schemes':
        return <SchemesView />;
      case 'loans':
        return <LoanProvidersView />;
      case 'network':
        return <NetworkView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans max-w-md mx-auto bg-white shadow-2xl">
      <Header 
        setActiveTab={setActiveTab} 
        unreadCount={unreadCount} 
        onNotificationClick={() => setShowNotificationsPanel(!showNotificationsPanel)} 
      />
      {showNotificationsPanel && (
        <NotificationsPanel 
          notifications={notifications} 
          onNotificationClick={handleNotificationClick} 
          onClose={() => setShowNotificationsPanel(false)} 
        />
      )}
      <main className="flex-1 overflow-y-auto pb-20 p-4 bg-[#F2F2F2]">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;