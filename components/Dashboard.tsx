import React, { useState } from 'react';
import { NavItem } from '../types';
import { useI18n } from '../i18n';

interface DashboardProps {
  setActiveTab: (tab: NavItem) => void;
}

const TrustScoreRect: React.FC<{ score: number }> = ({ score }) => {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-baseline">
                <span className="font-bold text-3xl text-black">{score}</span>
                <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-[#0a2540] h-2.5 rounded-full" 
                    style={{ width: `${score}%` }}>
                </div>
            </div>
        </div>
    );
};

const NewsTicker: React.FC = () => {
    const { t } = useI18n();
    return (
        <>
        <style>{`
            .marquee-container {
                overflow: hidden;
                position: relative;
                width: 100%;
            }
            .marquee-content {
                display: inline-block;
                white-space: nowrap;
                animation: marquee 20s linear infinite;
                padding-left: 100%; /* Start off-screen */
            }
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
        `}</style>
        <div className="bg-white p-2 rounded-xl shadow-sm flex items-center space-x-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">{t('dashboard.newsTicker.title')}</span>
            <div className="marquee-container flex-1 h-6 flex items-center">
                 <p className="marquee-content text-sm text-gray-600">
                    {t('dashboard.newsTicker.headlines')}
                </p>
            </div>
        </div>
        </>
    )
}

const Achievement: React.FC<{ icon: string; title: string; completed: boolean }> = ({ icon, title, completed }) => {
    const { t } = useI18n();
    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${completed ? 'bg-white' : 'bg-gray-100'}`}>
            <div className={`p-2 rounded-full ${completed ? 'bg-[#0a2540] text-white' : 'bg-gray-300 text-gray-600'}`}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <p className={`font-semibold ${completed ? 'text-black' : 'text-gray-800'}`}>{title}</p>
                <p className={`text-xs ${completed ? 'text-gray-600' : 'text-gray-500'}`}>{completed ? t('dashboard.status.completed') : t('dashboard.status.inProgress')}</p>
            </div>
        </div>
    )
};

const SalesAnalytics: React.FC = () => {
    const { t } = useI18n();
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

    const data = {
        day: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], values: [30, 50, 80, 60, 75, 55, 90] },
        week: { labels: ['W1', 'W2', 'W3', 'W4'], values: [350, 400, 380, 500] },
        month: { labels: ['J', 'F', 'M', 'A', 'M', 'J'], values: [1500, 1800, 1600, 2000, 1900, 2200] }
    };

    const currentData = data[period];
    const maxValue = Math.max(...currentData.values);

    const insightKey = `dashboard.salesAnalytics.insights_${period}`;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{t('dashboard.salesAnalytics.title')}</h3>
                <div className="flex bg-gray-200 rounded-full p-1">
                    <button onClick={() => setPeriod('day')} className={`px-3 py-1 text-sm font-semibold rounded-full ${period === 'day' ? 'bg-white shadow' : ''}`}>{t('dashboard.salesAnalytics.day')}</button>
                    <button onClick={() => setPeriod('week')} className={`px-3 py-1 text-sm font-semibold rounded-full ${period === 'week' ? 'bg-white shadow' : ''}`}>{t('dashboard.salesAnalytics.week')}</button>
                    <button onClick={() => setPeriod('month')} className={`px-3 py-1 text-sm font-semibold rounded-full ${period === 'month' ? 'bg-white shadow' : ''}`}>{t('dashboard.salesAnalytics.month')}</button>
                </div>
            </div>
            {/* Chart */}
            <div className="h-48 flex items-end justify-around space-x-2 pt-4">
                {currentData.values.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                            className="w-full bg-gray-300 rounded-t-md hover:bg-gray-400 transition-all" 
                            style={{ height: `${(value / maxValue) * 100}%` }}
                            title={`₹${value}`}
                        ></div>
                        <span className="text-xs font-medium text-gray-500 mt-1">{currentData.labels[index]}</span>
                    </div>
                ))}
            </div>
            {/* AI Insights */}
            <div className="bg-[#F2F2F2] p-3 rounded-lg flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#0a2540] flex-shrink-0 flex items-center justify-center text-white mt-1">
                    <i className="fa-solid fa-lightbulb"></i>
                </div>
                <div>
                    <h4 className="font-bold text-black">{t('dashboard.salesAnalytics.aiInsightsTitle')}</h4>
                    <p className="text-sm text-gray-700">{t(insightKey)}</p>
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
    const { t } = useI18n();

    return (
        <div className="space-y-6 text-black">
            <h2 className="text-3xl font-bold">{t('dashboard.welcome')}</h2>
            
            <NewsTicker />
            
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="text-lg font-bold">{t('dashboard.trustScoreTitle')}</h3>
                <TrustScoreRect score={78} />
                <p className="text-center text-xs text-gray-500 pt-2">
                    {t('dashboard.trustScoreDescription')}
                </p>
            </div>
            
            <SalesAnalytics />

            <div className="space-y-4">
                 <h3 className="text-lg font-bold">{t('dashboard.journeyTitle')}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Achievement icon="fa-file-invoice" title={t('dashboard.achievements.invoices')} completed={true} />
                     <Achievement icon="fa-box" title={t('dashboard.achievements.products')} completed={true} />
                     <Achievement icon="fa-lightbulb" title={t('dashboard.achievements.copilot')} completed={true} />
                     <Achievement icon="fa-users" title={t('dashboard.achievements.network')} completed={false} />
                 </div>
            </div>

            <div className="space-y-3">
                 <h3 className="text-lg font-bold">{t('dashboard.quickActionsTitle')}</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setActiveTab('copilot')}
                        className="bg-black text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:bg-gray-800 transition"
                    >
                        <i className="fa-solid fa-microphone"></i>
                        <span>{t('dashboard.actions.aiCopilot')}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('invoice')}
                        className="bg-black text-white p-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:bg-gray-800 transition"
                    >
                         <i className="fa-solid fa-plus"></i>
                        <span>{t('dashboard.actions.newInvoice')}</span>
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;