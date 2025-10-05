import React from 'react';
import { Notification } from '../types';
import { useI18n } from '../i18n';

interface NotificationsPanelProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onNotificationClick, onClose }) => {
  const { t } = useI18n();
  return (
    <div className="absolute top-20 right-4 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-20">
      <div className="p-3 flex justify-between items-center border-b border-gray-200">
        <h3 className="font-bold text-black">{t('notifications.panel.title')}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-500">{t('notifications.panel.empty')}</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => onNotificationClick(n)}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-[#0a2540]/10' : ''}`}
            >
              <p className="font-semibold text-black">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;