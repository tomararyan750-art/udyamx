import React, { useState, useEffect, useRef } from 'react';
import { InvoiceItem, Invoice } from '../types';
import Icon from './Icon';
import useLocalStorage from './useLocalStorage';
import { useOnlineStatus } from './useOnlineStatus';
import { useI18n } from '../i18n';

// For browsers that don't have this typed
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const InvoiceGenerator: React.FC = () => {
  const { t } = useI18n();
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('udyamx-invoices', []);
  const isOnline = useOnlineStatus();
  
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOnline) {
      const invoicesToSync = invoices.filter(inv => inv.status === 'queued');
      if (invoicesToSync.length > 0) {
        console.log(`Syncing ${invoicesToSync.length} invoices...`);
        // In a real app, you would make API calls here.
        // We'll simulate a network delay.
        setTimeout(() => {
          setInvoices(currentInvoices => 
            currentInvoices.map(inv => 
              inv.status === 'queued' ? { ...inv, status: 'sent' } : inv
            )
          );
          alert(t('invoice.alerts.syncMessage').replace('{count}', invoicesToSync.length.toString()));
        }, 1500);
      }
    }
  }, [isOnline, invoices, setInvoices, t]);

  // Effect for setting up Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        alert(t('copilot.errors.permission').replace('{error}', event.error));
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', transcript);
        alert(t('invoice.alerts.voiceCommandReceived'));
        setClientName('Local Coffee Shop');
        setItems([
            { description: '1 Dozen Croissants', quantity: 2, price: 24.00 },
            { description: 'Sourdough Loaf', quantity: 5, price: 7.50 },
        ]);
      };
    }
    return () => recognitionRef.current?.stop();
  }, [t]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);
  };

  const handleVoiceGenerate = () => {
    if (!recognitionRef.current) {
      alert(t('copilot.errors.unsupported'));
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err)
        alert(t('copilot.errors.startError'))
      }
    }
  };

  const resetForm = () => {
    setClientName('');
    setItems([{ description: '', quantity: 1, price: 0 }]);
  };

  const handleSaveDraft = () => {
    if (!clientName || items.some(item => !item.description || item.quantity <= 0 || item.price < 0)) {
        alert(t('invoice.alerts.draftValidation'));
        return;
    }
    
    const newInvoice: Invoice = {
        id: new Date().toISOString(),
        clientName,
        items,
        total: parseFloat(calculateTotal()),
        status: 'draft',
    };

    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
    alert(t('invoice.alerts.draftSaved'));
    resetForm();
  };
  
  const handlePrint = () => {
    if (!clientName || items.some(item => !item.description)) {
      alert(t('invoice.alerts.printValidation'));
      return;
    }

    const total = calculateTotal();
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice - ${clientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #fff; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; font-size: 16px; line-height: 24px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #0a2540; font-size: 2.5em; }
            .company-details { text-align: right; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .details strong { display: block; margin-bottom: 5px; color: #555; }
            table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            table th { background: #f5f5f5; font-weight: bold; padding: 10px; border-bottom: 2px solid #ddd; }
            table td { padding: 10px; border-bottom: 1px solid #eee; }
            .total-section { display: flex; justify-content: flex-end; margin-top: 30px; }
            .total-table { width: 50%; }
            .total-table .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; }
            .footer { text-align: center; color: #777; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
             <div class="header"><h1>INVOICE</h1><div class="company-details"><strong>UdyamX Inc.</strong><br>123 Business Lane<br>Innovation City, 12345</div></div>
             <div class="details"><div><strong>BILL TO</strong>${clientName}</div><div><strong>Invoice #:</strong> ${Date.now().toString().slice(-6)}<br><strong>Date:</strong> ${new Date().toLocaleDateString()}</div></div>
            <table><thead><tr><th>Item Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
              <tbody>${items.map(item => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>₹${item.price.toFixed(2)}</td><td>₹${(item.quantity * item.price).toFixed(2)}</td></tr>`).join('')}</tbody>
            </table>
            <div class="total-section"><table class="total-table"><tr class="total"><td>Total:</td><td style="text-align: right;">₹${total}</td></tr></table></div>
            <div class="footer">Thank you for your business!</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
  };

  const InvoiceList = () => (
    <div className="space-y-3 mb-8">
        <h3 className="text-lg font-bold">{t('invoice.savedInvoicesTitle')}</h3>
        {invoices.length === 0 ? (
            <div className="text-center py-4 bg-white rounded-lg">
                <p className="text-gray-500 text-sm">{t('invoice.noSavedInvoices')}</p>
            </div>
        ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {invoices.map(invoice => (
                    <div key={invoice.id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{invoice.clientName}</p>
                            <p className="text-sm text-gray-500">{t('invoice.totalLabel')} ₹{invoice.total.toFixed(2)}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'queued' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="space-y-6 text-black">
      <InvoiceList />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('invoice.newInvoiceTitle')}</h2>
        <button 
          onClick={handleVoiceGenerate}
          className={`bg-black text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow hover:bg-gray-800 transition ${isListening ? 'animate-pulse' : ''}`}
        >
          <Icon icon="voice" className="w-5 h-5"/>
          <span>{isListening ? t('invoice.listening') : t('invoice.generateWithVoice')}</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-600">{t('invoice.clientNameLabel')}</label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">{t('invoice.itemsTitle')}</h3>
        {items.map((item, index) => (
          <div key={index} className="bg-[#F2F2F2] p-3 rounded-xl flex flex-col md:flex-row md:items-center gap-3">
            <input
              type="text"
              placeholder={t('invoice.itemDescriptionPlaceholder')}
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-md bg-white text-black"
            />
            <div className="flex gap-3">
              <input
                type="number"
                placeholder={t('invoice.itemQtyPlaceholder')}
                value={item.quantity}
                min="0"
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                className="w-1/3 p-2 border border-gray-300 rounded-md bg-white text-black"
              />
              <input
                type="number"
                placeholder={t('invoice.itemPricePlaceholder')}
                value={item.price}
                min="0"
                step="0.01"
                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                className="w-2/3 p-2 border border-gray-300 rounded-md bg-white text-black"
              />
            </div>
            <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2 md:bg-transparent bg-red-100 rounded-md">
                <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        ))}
        <button onClick={addItem} className="text-black font-bold flex items-center space-x-2">
          <Icon icon="plus" className="w-5 h-5"/>
          <span>{t('invoice.addItem')}</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-200 rounded-lg flex justify-between items-center font-bold">
        <span className="text-xl">{t('invoice.totalLabel')}</span>
        <span className="text-2xl text-[#0a2540]">₹{calculateTotal()}</span>
      </div>

      <div className="flex gap-4">
        <button onClick={handleSaveDraft} className="flex-1 bg-gray-500 text-white p-3 rounded-lg font-bold shadow hover:bg-gray-600 transition">{t('invoice.saveDraft')}</button>
        <button 
          onClick={handlePrint} 
          className="flex-1 bg-[#0a2540] text-white p-3 rounded-lg font-bold shadow hover:opacity-90 transition"
        >
          {t('invoice.print')}
        </button>
      </div>
    </div>
  );
};

export default InvoiceGenerator;