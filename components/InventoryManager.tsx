import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import Icon from './Icon';
import useLocalStorage from './useLocalStorage';
import { useI18n } from '../i18n';

const initialProducts: Product[] = [
  { id: '1', name: 'Handmade Soap', sku: 'HSOAP-001', quantity: 45, price: 5.99 },
  { id: '2', name: 'Scented Candle', sku: 'SCAND-002', quantity: 60, price: 12.50 },
  { id: '3', name: 'Artisan Bread', sku: 'ABRD-001', quantity: 15, price: 7.00 },
];

const MOCK_PRODUCT_DATABASE: { [key: string]: Omit<Product, 'id' | 'quantity'> } = {
  '8901030724941': { name: 'Tata Salt (1kg)', sku: '8901030724941', price: 28.00 },
  '8901058853789': { name: 'Maggi Noodles (70g)', sku: '8901058853789', price: 14.00 },
  '8901233019827': { name: 'Parle-G Biscuit (56g)', sku: '8901233019827', price: 5.00 },
};


const ProductListItem: React.FC<{ product: Product }> = ({ product }) => {
    const { t } = useI18n();
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div>
                <p className="font-semibold text-black">{product.name}</p>
                <p className="text-sm text-gray-500">SKU: {product.sku} | Price: ₹{product.price.toFixed(2)}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg text-[#0a2540]">{product.quantity}</p>
                <p className="text-sm text-gray-500">{t('inventory.inStock')}</p>
            </div>
        </div>
    )
};

const CameraScanner: React.FC<{
    onClose: () => void;
    onScanSuccess: (barcode: string) => void;
}> = ({ onClose, onScanSuccess }) => {
    const { t } = useI18n();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanMessage, setScanMessage] = useState(t('inventory.scanner.scanMessage'));

    useEffect(() => {
        let stream: MediaStream | null = null;
        const enableStream = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError(t('inventory.scanner.errorMessage'));
            }
        };

        enableStream();

        const scanTimeout = setTimeout(() => {
            setScanMessage(t('inventory.scanner.detected'));
            const allPossibleBarcodes = ['8901030724941', 'SCAND-002', `NEW-${Math.floor(1000 + Math.random() * 9000)}`];
            const scannedBarcode = allPossibleBarcodes[Math.floor(Math.random() * allPossibleBarcodes.length)];
            
            setTimeout(() => onScanSuccess(scannedBarcode), 800);
        }, 2500);

        return () => {
            clearTimeout(scanTimeout);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScanSuccess, t]);

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4">
            <div className="w-full max-w-md aspect-square bg-gray-900 rounded-lg relative overflow-hidden shadow-2xl">
                {error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
                        <p className="text-lg font-bold text-red-500">{t('inventory.scanner.errorTitle')}</p>
                        <p>{error}</p>
                    </div>
                ) : ( <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" /> )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-white text-center absolute top-4 left-0 right-0 bg-black bg-opacity-50 py-1 font-semibold">{scanMessage}</p>
                    <div className="w-4/5 h-1/2 border-y-4 border-dashed border-green-500/70 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-[scan_2s_ease-in-out_infinite] shadow-lg"></div>
                    </div>
                </div>
                 <style>{`@keyframes scan { 0% { transform: translateY(0); } 50% { transform: translateY(calc(100% - 1px)); } 100% { transform: translateY(0); } }`}</style>
            </div>
            <button onClick={onClose} className="mt-6 bg-white text-black px-8 py-3 rounded-full font-bold text-lg">
                {t('inventory.scanner.cancel')}
            </button>
        </div>
    );
};

const AddProductModal: React.FC<{
    onSave: (product: Omit<Product, 'id'>) => void;
    onClose: () => void;
    initialSku: string | null;
}> = ({ onSave, onClose, initialSku }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [sku, setSku] = useState(initialSku || `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

    const handleSave = () => {
        if (!name || quantity <= 0 || price < 0) {
            alert(t('inventory.modal.validation'));
            return;
        }
        onSave({ name, quantity, price, sku });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                <h3 className="text-xl font-bold text-black">{t('inventory.modal.addProduct')}</h3>
                 <div>
                    <label htmlFor="itemSku" className="block text-sm font-medium text-gray-600">{t('inventory.modal.skuLabel')}</label>
                    <input type="text" id="itemSku" value={sku} onChange={e => setSku(e.target.value)} disabled={!!initialSku} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black disabled:bg-gray-200" />
                </div>
                <div>
                    <label htmlFor="itemName" className="block text-sm font-medium text-gray-600">{t('inventory.modal.nameLabel')}</label>
                    <input type="text" id="itemName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black" />
                </div>
                <div>
                    <label htmlFor="itemQty" className="block text-sm font-medium text-gray-600">{t('inventory.modal.qtyLabel')}</label>
                    <input type="number" id="itemQty" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} min="1" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black" />
                </div>
                 <div>
                    <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-600">{t('inventory.modal.priceLabel')}</label>
                    <input type="number" id="itemPrice" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} min="0" step="0.01" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0a2540] focus:border-[#0a2540] bg-white text-black" />
                </div>
                <div className="flex gap-4 pt-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-bold hover:bg-gray-300 transition">{t('inventory.modal.cancel')}</button>
                    <button onClick={handleSave} className="flex-1 bg-[#0a2540] text-white p-3 rounded-lg font-bold shadow hover:opacity-90 transition">{t('inventory.modal.save')}</button>
                </div>
            </div>
        </div>
    );
};

const InventoryManager: React.FC = () => {
  const { t } = useI18n();
  const [products, setProducts] = useLocalStorage<Product[]>('udyamx-inventory', initialProducts);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scannedSku, setScannedSku] = useState<string | null>(null);

  const handleSaveProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...newProductData, id: new Date().toISOString() };
    setProducts(prev => [...prev, newProduct]);
    setShowAddModal(false);
    setScannedSku(null);
  };

  const handleScanSuccess = (barcode: string) => {
    setShowScanner(false);
    const existingProductIndex = products.findIndex(p => p.sku === barcode);

    if (existingProductIndex > -1) {
        const updatedProducts = [...products];
        const productToUpdate = { ...updatedProducts[existingProductIndex] };
        productToUpdate.quantity += 1;
        updatedProducts[existingProductIndex] = productToUpdate;
        setProducts(updatedProducts);
        alert(t('inventory.alerts.quantityUpdated').replace('{name}', productToUpdate.name).replace('{quantity}', productToUpdate.quantity.toString()));
    } else {
        const productFromDb = MOCK_PRODUCT_DATABASE[barcode];
        if (productFromDb) {
            const newProduct: Product = { ...productFromDb, id: new Date().toISOString(), quantity: 1 };
            setProducts(prev => [...prev, newProduct]);
            alert(t('inventory.alerts.itemAdded').replace('{name}', newProduct.name));
        } else {
            setScannedSku(barcode);
            setShowAddModal(true);
        }
    }
  };

  const handleOpenAddModal = () => {
    setScannedSku(null);
    setShowAddModal(true);
  }

  return (
    <div className="space-y-6 text-black">
      {showScanner && <CameraScanner onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} />}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onSave={handleSaveProduct} initialSku={scannedSku} />}
      <h2 className="text-2xl font-bold">{t('inventory.title')}</h2>

      <div className="flex gap-4">
        <button onClick={() => setShowScanner(true)} className="flex-1 bg-black text-white p-3 rounded-lg font-bold flex items-center justify-center space-x-2 shadow hover:bg-gray-800 transition">
          <Icon icon="scan" className="w-6 h-6"/>
          <span>{t('inventory.scan')}</span>
        </button>
        <button onClick={handleOpenAddModal} className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-bold flex items-center justify-center space-x-2 shadow hover:bg-gray-300 transition">
          <Icon icon="plus" className="w-6 h-6"/>
          <span>{t('inventory.addManual')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {products.length > 0 ? products.map((product) => (
          <ProductListItem key={product.id} product={product} />
        )) : (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">{t('inventory.empty')}</p>
            <p className="text-sm text-gray-400">{t('inventory.empty_sub')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;