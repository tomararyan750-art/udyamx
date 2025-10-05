import React from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useI18n } from '../i18n';

const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();
    const { t } = useI18n();

    if (isOnline) {
        return null;
    }

    return (
        <div 
          className="flex items-center space-x-2 text-sm text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full" 
          title="You are offline. Changes are saved locally and will sync when connection is restored."
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{t('offline')}</span>
        </div>
    );
};

export default OfflineIndicator;