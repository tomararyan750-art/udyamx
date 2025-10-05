import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InvoiceItem, Invoice, Product } from '../types';
import Icon from './Icon';
import useLocalStorage from './useLocalStorage';
import { useOnlineStatus } from './useOnlineStatus';
import { useI18n } from '../i18n';
import { parseItemsFromText } from '../services/geminiService';

// For browsers that don't have this typed
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceControlModal: React.FC<{
  voiceState: 'speaking' | 'listening' | 'processing';
  voiceStep: 'clientName' | 'items';
  transcript: string;
  onClose: () => void;
}> = ({ voiceState, voiceStep, transcript, onClose }) => {
    const { t } = useI18n();

    const getStatusText = () => {
        if (voiceState === 'processing') return t('invoice.voice.statusProcessing');
        if (voiceStep === 'clientName') {
             return voiceState === 'speaking' ? t('invoice.voice.askClientName') : t('invoice.voice.statusListening');
        }
        if (voiceStep === 'items') {
            return voiceState === 'speaking' ? t('invoice.voice.askItemsProcessing') : t('invoice.voice.statusListening');
        }
        return t('invoice.voice.statusListening');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 p-4 text-white text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center ${voiceState === 'listening' ? 'animate-pulse' : ''}`}>
                    <Icon icon="microphone" className="w-10 h-10 text-black" />
                </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{getStatusText()}</h3>
            {voiceState === 'listening' && voiceStep === 'items' && <p className="max-w-md text-gray-300 mb-4">{t('invoice.voice.exampleItems')}</p>}
            {transcript && <p className="italic text-gray-200 mt-4 text-lg">"{transcript}"</p>}
            <button onClick={onClose} className="mt-8 bg-white/20 px-6 py-2 rounded-full font-semibold">
                {t('inventory.scanner.cancel')}
            </button>
        </div>
    );
};


const InvoiceGenerator: React.FC = () => {
  const { t, locale } = useI18n();
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('udyamx-invoices', []);
  const [products] = useLocalStorage<Product[]>('udyamx-inventory', []);
  const isOnline = useOnlineStatus();
  
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const recognitionRef = useRef<any>(null);
  
  // New states for voice control
  const [isVoiceControlOpen, setIsVoiceControlOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'speaking' | 'listening' | 'processing'>('idle');
  const [voiceStep, setVoiceStep] = useState<'clientName' | 'items'>('clientName');
  const [transcript, setTranscript] = useState('');

  const localeToLangTag = (l: string) => {
    switch (l) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-US';
    }
  };
  const langTag = localeToLangTag(locale);

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
  
 const resetVoiceControl = useCallback(() => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsVoiceControlOpen(false);
    setVoiceState('idle');
    setTranscript('');
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel(); // Ensure no other speech is active
    setVoiceState('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langTag;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      resetVoiceControl();
    }
    window.speechSynthesis.speak(utterance);
  }, [resetVoiceControl, langTag]);
  
  // Effect for initializing and tearing down speech recognition on mount/unmount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
       if (!recognitionRef.current) {
         recognitionRef.current = new SpeechRecognition();
         recognitionRef.current.continuous = false;
         recognitionRef.current.interimResults = false;
         recognitionRef.current.maxAlternatives = 1;
       }
       recognitionRef.current.lang = langTag;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [langTag]);

  // Effect for attaching/updating speech recognition event handlers
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    const recognition = recognitionRef.current;

    recognition.onstart = () => setVoiceState('listening');

    recognition.onend = () => {
      setVoiceState(currentState => {
        if (currentState === 'listening') {
          return 'idle';
        }
        return currentState;
      });
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        console.log('Recognition aborted by user.');
        return; 
      }
      if (event.error === 'no-speech') {
        speak(t('invoice.voice.noSpeech'), () => {
           setVoiceState('listening');
           if (recognitionRef.current) {
               try {
                   recognitionRef.current.start();
               } catch(e) {
                   console.error("Error restarting recognition on no-speech", e);
                   resetVoiceControl();
               }
           }
        });
        return;
      }
      console.error('Speech recognition error', event.error);
      alert(t('copilot.errors.permission').replace('{error}', event.error));
      resetVoiceControl();
    };

    recognition.onresult = async (event: any) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);
      setVoiceState('processing');

      if (voiceStep === 'clientName') {
        setClientName(currentTranscript);
        setVoiceStep('items');
        speak(t('invoice.voice.askItems').replace('{clientName}', currentTranscript), () => {
          setTranscript('');
          setVoiceState('listening');
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        });
      } else if (voiceStep === 'items') {
        try {
          const parsedData = await parseItemsFromText(currentTranscript);
          
          let itemsWereAdded = false;
          let itemsWereRemoved = false;
          let itemsWereUpdated = false;
          let tempItems = [...items];

          // Process removals
          if (parsedData.remove && parsedData.remove.length > 0) {
            const descriptionsToRemove = new Set(parsedData.remove.map(r => r.description.toLowerCase()));
            tempItems = tempItems.filter(item => !descriptionsToRemove.has(item.description.toLowerCase()));
            itemsWereRemoved = true;
          }

          // Process updates
          if (parsedData.update && parsedData.update.length > 0) {
            tempItems = tempItems.map(item => {
              const updateAction = parsedData.update.find(u => u.description.toLowerCase() === item.description.toLowerCase());
              if (updateAction && typeof updateAction.quantity === 'number') {
                itemsWereUpdated = true;
                return { ...item, quantity: updateAction.quantity };
              }
              return item;
            });
          }

          // Process additions
          if (parsedData.add && parsedData.add.length > 0) {
            const itemsWithPrices = parsedData.add.map(item => {
              const matchedProduct = products.find(p => p.name.toLowerCase() === item.description.toLowerCase());
              return matchedProduct ? { ...item, price: matchedProduct.price } : item;
            });
            tempItems = [...tempItems, ...itemsWithPrices];
            itemsWereAdded = true;
          }

          const anyActionTaken = itemsWereAdded || itemsWereRemoved || itemsWereUpdated;

          if (anyActionTaken) {
            setItems(tempItems);
            speak(`${t('invoice.voice.confirmations.changesMade')} ${t('invoice.voice.askMoreItems')}`, () => {
              setTranscript('');
              setVoiceState('listening');
              if (recognitionRef.current) recognitionRef.current.start();
            });
          } else {
             if (items.length > 0) {
                speak(t('invoice.voice.confirmItems'), resetVoiceControl);
             } else {
                speak(t('invoice.alerts.voiceParseError'), () => {
                    setTranscript('');
                    setVoiceState('listening');
                    if (recognitionRef.current) recognitionRef.current.start();
                });
             }
          }
        } catch (e) {
          console.error("Error parsing items", e);
          speak(t('invoice.alerts.voiceParseError'), resetVoiceControl);
        }
      }
    };

    return () => {
      if (recognitionRef.current) {
        // Clean up handlers when effect re-runs or component unmounts
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
      }
    };
  }, [t, voiceStep, speak, resetVoiceControl, items, products]);


  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };
    (currentItem as any)[field] = value;
    
    if (field === 'description' && typeof value === 'string' && value.length > 0) {
        const matchedProduct = products.find(p => p.name.toLowerCase() === value.toLowerCase());
        if (matchedProduct) {
            currentItem.price = matchedProduct.price;
        }
    }
    
    newItems[index] = currentItem;
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
    if (!recognitionRef.current || !window.speechSynthesis) {
        alert(t('copilot.errors.unsupported'));
        return;
    }

    if (isVoiceControlOpen) {
        resetVoiceControl();
        return;
    }
    
    setClientName('');
    setItems([]);

    setIsVoiceControlOpen(true);
    setVoiceStep('clientName');
    speak(t('invoice.voice.askClientName'), () => {
       setVoiceState('listening');
       try {
         if (recognitionRef.current) {
            recognitionRef.current.start();
         }
       } catch(e) {
         console.error("Could not start recognition", e);
         resetVoiceControl();
       }
    });
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
       <datalist id="inventory-products">
           {products.map(p => <option key={p.id} value={p.name} />)}
       </datalist>
       {isVoiceControlOpen && (
            <VoiceControlModal 
                voiceState={voiceState as any} 
                voiceStep={voiceStep}
                transcript={transcript}
                onClose={resetVoiceControl}
            />
        )}
      <InvoiceList />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('invoice.newInvoiceTitle')}</h2>
        <button 
          onClick={handleVoiceGenerate}
          className={`bg-black text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow hover:bg-gray-800 transition ${isVoiceControlOpen ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          <Icon icon="voice" className="w-5 h-5"/>
          <span>{isVoiceControlOpen ? t('inventory.scanner.cancel') : t('invoice.generateWithVoice')}</span>
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

      <div className="space-y-4">
        <h3 className="text-lg font-bold">{t('invoice.itemsTitle')}</h3>
        {items.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-12 gap-x-4 gap-y-3 items-end">
            {/* Description */}
            <div className="col-span-2 md:col-span-5">
              <label htmlFor={`description-${index}`} className="block text-xs font-medium text-gray-500 mb-1">{t('invoice.itemDescriptionPlaceholder')}</label>
              <input
                id={`description-${index}`}
                type="text"
                placeholder="e.g., Handmade Soap"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black"
                list="inventory-products"
              />
            </div>

            {/* Quantity */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor={`quantity-${index}`} className="block text-xs font-medium text-gray-500 mb-1">{t('invoice.itemQtyPlaceholder')}</label>
              <input
                id={`quantity-${index}`}
                type="number"
                value={item.quantity}
                min="0"
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black text-center"
              />
            </div>

            {/* Price */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor={`price-${index}`} className="block text-xs font-medium text-gray-500 mb-1">{t('invoice.itemPricePlaceholder')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">₹</span>
                <input
                  id={`price-${index}`}
                  type="number"
                  value={item.price}
                  min="0"
                  step="0.01"
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 pl-7 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black"
                />
              </div>
            </div>

            {/* Item Total */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-start md:items-end">
              <span className="text-xs font-medium text-gray-500">{t('invoice.itemTotal')}</span>
              <p className="font-bold text-black text-lg">
                ₹{(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
            
            {/* Remove Button */}
            <div className="col-span-1 md:col-span-1 flex justify-end">
              <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 p-2 rounded-md transition-colors h-10 w-10 flex items-center justify-center">
                  <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
        <button onClick={addItem} className="text-black font-bold flex items-center space-x-2 pt-2">
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