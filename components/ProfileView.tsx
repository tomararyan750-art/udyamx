import React from 'react';
import { useI18n } from '../i18n';
import { Locale } from '../types';

const ProfileView: React.FC = () => {
  const { t, setLocale, locale } = useI18n();

  const languages: { code: Locale; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
  ];

  return (
    <div className="space-y-6 text-black">
      <h2 className="text-2xl font-bold text-center">{t('profile.title')}</h2>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col items-center space-y-4">
        <img 
            src={`https://i.pravatar.cc/150?u=a042581f4e29026704d`} 
            alt="User Avatar" 
            className="w-28 h-28 rounded-full object-cover shadow-lg" 
        />
        <div className="text-center">
            <h3 className="text-2xl font-bold text-black">{t('profile.name')}</h3>
            <p className="text-md text-gray-500">{t('profile.email')}</p>
        </div>
        <div className="text-center pt-2">
            <p className="font-semibold text-gray-700">{t('profile.businessName')}</p>
            <p className="text-sm text-gray-500">{t('profile.joined')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm space-y-3">
          <h4 className="font-bold text-black">{t('profile.language.title')}</h4>
          <div className="flex space-x-2">
              {languages.map(lang => (
                  <button 
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        locale === lang.code 
                        ? 'bg-[#0a2540] text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                      {lang.name}
                  </button>
              ))}
          </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm space-y-2">
         <button className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">
            {t('profile.actions.accountSettings')}
         </button>
         <button className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition">
            {t('profile.actions.help')}
         </button>
         <button className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition">
            {t('profile.actions.logout')}
         </button>
      </div>

    </div>
  );
};

export default ProfileView;