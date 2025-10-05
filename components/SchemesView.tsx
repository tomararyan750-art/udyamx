import React from 'react';
import { Scheme } from '../types';
import { useI18n } from '../i18n';

const mockSchemes: Scheme[] = [
  {
    id: '1',
    name: 'Mudra Loan Scheme',
    description: 'Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro-enterprises.',
    eligibility: 'Any Indian Citizen who has a business plan for a non-farm sector income-generating activity.',
    link: 'https://www.mudra.org.in/',
  },
  {
    id: '2',
    name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
    description: 'A credit-linked subsidy programme for setting up of new micro-enterprises and to generate employment.',
    eligibility: 'Any individual, above 18 years of age. For manufacturing sector, the project cost should not be more than ₹25 lakhs. For business/service sector, not more than ₹10 lakhs.',
    link: 'https://www.kviconline.gov.in/pmegp/',
  },
  {
    id: '3',
    name: 'Credit Guarantee Fund Scheme for Micro and Small Enterprises (CGS)',
    description: 'Provides collateral-free credit to the micro and small enterprise sector.',
    eligibility: 'Both new and existing Micro and Small Enterprises (MSEs) are eligible for coverage under the scheme.',
    link: 'https://www.cgtmse.in/',
  },
  {
    id: '4',
    name: 'Stand-Up India Scheme',
    description: 'Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch.',
    eligibility: 'Enterprises in trading, manufacturing, or services sectors. In case of non-individual enterprises, 51% of the shareholding and controlling stake should be held by either an SC/ST or woman entrepreneur.',
    link: 'https://www.standupmitra.in/',
  },
];

const SchemeCard: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-3">
      <h3 className="text-xl font-bold text-[#0a2540]">{scheme.name}</h3>
      <p className="text-sm text-gray-600">{scheme.description}</p>
      <div>
        <h4 className="font-semibold text-black">{t('schemes.eligibility')}</h4>
        <p className="text-sm text-gray-500">{scheme.eligibility}</p>
      </div>
      <a 
        href={scheme.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block mt-2 bg-gray-200 text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-300 transition"
      >
        {t('schemes.learnMore')}
      </a>
    </div>
  );
};

const SchemesView: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">{t('schemes.title')}</h2>
      <p className="text-gray-600">
        {t('schemes.description')}
      </p>

      <div className="space-y-4">
        {mockSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>
    </div>
  );
};

export default SchemesView;