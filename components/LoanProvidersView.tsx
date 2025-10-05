import React from 'react';
import { LoanProvider } from '../types';
import { useI18n } from '../i18n';

// Mock data for loan providers
const mockLoanProviders: LoanProvider[] = [
  {
    id: '1',
    name: 'FinCorp Solutions',
    interestRate: 'Starting at 8.5% p.a.',
    minLoanAmount: '₹50,000',
    applyLink: '#',
  },
  {
    id: '2',
    name: 'MSME Capital',
    interestRate: '9.0% - 14.5% p.a.',
    minLoanAmount: '₹1,00,000',
    applyLink: '#',
  },
  {
    id: '3',
    name: 'Growth Finance Inc.',
    interestRate: 'Flexible rates available',
    minLoanAmount: '₹25,000',
    applyLink: '#',
  },
  {
    id: '4',
    name: 'Udyam Credit Bank',
    interestRate: 'Starting at 7.9% p.a.',
    minLoanAmount: '₹75,000',
    applyLink: '#',
  },
];

const LoanProviderCard: React.FC<{ provider: LoanProvider }> = ({ provider }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
      <h3 className="text-xl font-bold text-[#0a2540]">{provider.name}</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
              <p className="font-semibold text-black">{t('loans.interestRate')}</p>
              <p className="text-gray-500">{provider.interestRate}</p>
          </div>
          <div>
              <p className="font-semibold text-black">{t('loans.minLoanAmount')}</p>
              <p className="text-gray-500">{provider.minLoanAmount}</p>
          </div>
      </div>
      <a 
        href={provider.applyLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block bg-[#0a2540] text-white px-5 py-2 rounded-lg font-bold shadow hover:opacity-90 transition"
      >
        {t('loans.applyNow')}
      </a>
    </div>
  );
};

const LoanProvidersView: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">{t('loans.title')}</h2>
      <p className="text-gray-600">
        {t('loans.description')}
      </p>

      <div className="space-y-4">
        {mockLoanProviders.map((provider) => (
          <LoanProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
};

export default LoanProvidersView;