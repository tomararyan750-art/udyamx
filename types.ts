export type NavItem = 'dashboard' | 'copilot' | 'invoice' | 'inventory' | 'network' | 'schemes' | 'loans' | 'profile';

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'queued';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface Business {
  id:string;
  name: string;
  category: string;
  distance: string;
  avatarUrl: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  link: string;
}

export interface LoanProvider {
  id: string;
  name: string;
  interestRate: string;
  minLoanAmount: string;
  applyLink: string;
}

export type Locale = 'en' | 'hi' | 'mr';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: {
    type: 'tab';
    target: NavItem;
  };
}
