import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductFormModal } from './components/ProductFormModal';
import { CashFlowDashboard } from './components/CashFlowDashboard';
import { GgfTaxGuideModal } from './components/GgfTaxGuideModal';
import { RegisteredProductsCatalog } from './components/RegisteredProductsCatalog';
import { RegisteredProductModal } from './components/RegisteredProductModal';
import { ProductItem, RegisteredProductItem } from './types';
import { defaultProducts, defaultRegisteredProducts } from './data/defaultData';
import { exportProductsToCSV } from './utils/exportUtils';
import { RotateCcw, CheckCircle, Upload, DownloadCloud, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'precificador_pro_products_v2';
const LEGACY_STORAGE_KEY = 'precificador_pro_products_v1';
const REGISTERED_STORAGE_KEY = 'precificador_pro_registered_products_v1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'catalog' | 'registered' | 'cashflow'>('catalog');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Master Registered Products State with localStorage persistence
  const [registeredProducts, setRegisteredProducts] = useState<RegisteredProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading registered products from localStorage:', e);
    }
    return defaultRegisteredProducts;
  });

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(registeredProducts));
    } catch (e) {
      console.error('Error saving registered products to localStorage:', e);
    }
  }, [registeredProducts]);

  // Products State with localStorage persistence
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      // Check v2 first, then fallback to v1
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const savedV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return defaultProducts;
  });

  // Save to localStorage whenever products update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage:', e);
    }
  }, [products]);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [preSelectedRegisteredProductId, setPreSelectedRegisteredProductId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Registered Product Modal States
  const [isRegisteredModalOpen, setIsRegisteredModalOpen] = useState(false);
  const [editingRegisteredProduct, setEditingRegisteredProduct] = useState<RegisteredProductItem | null>(null);

  // Handlers for Pricing Products
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setPreSelectedRegisteredProductId(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    setPreSelectedRegisteredProductId(product.registeredProductId || null);
    setIsFormOpen(true);
  };

  const handleDuplicateProduct = (product: ProductItem) => {
    const duplicated: ProductItem = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: `${product.code}-COP`,
      name: `${product.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [duplicated, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast(`Cópia criada com sucesso: "${duplicated.name}"`);
  };

  const handleDeleteProduct = (id: string) => {
    const toDelete = products.find((p) => p.id === id);
    if (window.confirm(`Tem certeza que deseja excluir o produto "${toDelete?.name || 'selecionado'}" do catálogo?`)) {
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      showToast('Produto excluído com sucesso.');
    }
  };

  const handleUpdateManualPrice = (id: string, newPrice: number | undefined) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            manualSalePrice: newPrice,
            pricingMethod: newPrice !== undefined ? ('target_price' as const) : ('markup_divisor' as const),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleUpdateMargin = (id: string, newMargin: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            desiredProfitMargin: newMargin,
            pricingMethod: 'markup_divisor' as const,
            manualSalePrice: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleSaveProduct = (productToSave: ProductItem) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === productToSave.id);
      let updated: ProductItem[];
      if (exists) {
        updated = prev.map((p) => (p.id === productToSave.id ? productToSave : p));
      } else {
        updated = [productToSave, ...prev];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return updated;
    });

    showToast(`Produto "${productToSave.name}" salvo com sucesso!`);
  };

  // Handlers for Master Registered Products
  const handleOpenNewRegisteredProduct = () => {
    setEditingRegisteredProduct(null);
    setIsRegisteredModalOpen(true);
  };

  const handleEditRegisteredProduct = (item: RegisteredProductItem) => {
    setEditingRegisteredProduct(item);
    setIsRegisteredModalOpen(true);
  };

  const handleDuplicateRegisteredProduct = (item: RegisteredProductItem) => {
    const duplicated: RegisteredProductItem = {
      ...item,
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: `${item.code}-COP`,
      name: `${item.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRegisteredProducts((prev) => [duplicated, ...prev]);
    showToast(`Cópia criada: "${duplicated.name}"`);
  };

  const handleDeleteRegisteredProduct = (id: string) => {
    const toDelete = registeredProducts.find((p) => p.id === id);
    if (window.confirm(`Tem certeza que deseja excluir o produto cadastrado "${toDelete?.name || ''}"?`)) {
      setRegisteredProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Produto cadastrado excluído.');
    }
  };

  const handleSaveRegisteredProduct = (itemToSave: RegisteredProductItem) => {
    setRegisteredProducts((prev) => {
      const exists = prev.some((p) => p.id === itemToSave.id);
      if (exists) {
        return prev.map((p) => (p.id === itemToSave.id ? itemToSave : p));
      } else {
        return [itemToSave, ...prev];
      }
    });
    showToast(`Produto cadastrado "${itemToSave.name}" salvo com sucesso!`);
  };

  const handleStartPricingForRegistered = (item: RegisteredProductItem) => {
    setEditingProduct(null);
    setPreSelectedRegisteredProductId(item.id);
    setIsFormOpen(true);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo originais (produtos e cadastros)?')) {
      setProducts(defaultProducts);
      setRegisteredProducts(defaultRegisteredProducts);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultProducts));
        localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(defaultRegisteredProducts));
      } catch (e) {
        console.error(e);
      }
      showToast('Produtos e cadastros de exemplo restaurados.');
    }
  };

  // Export full JSON database
  const handleExportJSON = () => {
    const exportData = {
      products,
      registeredProducts,
      version: '2.1',
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `precificador_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON baixado com sucesso!');
  };

  // Import JSON database
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.products)) {
            setProducts(parsed.products);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed.products));
          } else if (Array.isArray(parsed)) {
            setProducts(parsed);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          }

          if (Array.isArray(parsed.registeredProducts)) {
            setRegisteredProducts(parsed.registeredProducts);
            localStorage.setItem(REGISTERED_STORAGE_KEY, JSON.stringify(parsed.registeredProducts));
          }

          showToast('Dados importados com sucesso!');
        } else {
          alert('O arquivo JSON não contém uma estrutura válida.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Toast Floating Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProduct={handleOpenNewProduct}
        onNewRegisteredProduct={handleOpenNewRegisteredProduct}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportCSV={() => exportProductsToCSV(products)}
        productCount={products.length}
        registeredProductCount={registeredProducts.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
            onDuplicateProduct={handleDuplicateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateManualPrice={handleUpdateManualPrice}
            onUpdateMargin={handleUpdateMargin}
            onExportCSV={() => exportProductsToCSV(products)}
          />
        )}

        {activeTab === 'registered' && (
          <RegisteredProductsCatalog
            registeredProducts={registeredProducts}
            onNewProduct={handleOpenNewRegisteredProduct}
            onEditProduct={handleEditRegisteredProduct}
            onDuplicateProduct={handleDuplicateRegisteredProduct}
            onDeleteProduct={handleDeleteRegisteredProduct}
            onStartPricing={handleStartPricingForRegistered}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashFlowDashboard products={products} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 mt-auto print:hidden">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-800 text-base">Precificador Pro</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">Formação de Preço Contábil (Markup Divisor & GGF) & Fluxo de Caixa</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleExportJSON}
              className="hover:text-slate-900 flex items-center gap-1 text-slate-600 hover:underline font-medium cursor-pointer"
              title="Salvar backup completo em arquivo JSON"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backup JSON</span>
            </button>

            <label className="hover:text-slate-900 flex items-center gap-1 text-slate-600 hover:underline font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Importar Backup</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <span className="text-slate-300">•</span>

            <button
              onClick={handleResetDefaults}
              className="hover:text-slate-900 flex items-center gap-1 text-slate-500 hover:underline font-medium cursor-pointer"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restaurar Exemplos</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal: Product Pricing Studio / Form */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
          setPreSelectedRegisteredProductId(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        registeredProducts={registeredProducts}
        preSelectedRegisteredProductId={preSelectedRegisteredProductId}
      />

      {/* Modal: Master Product Registration */}
      <RegisteredProductModal
        isOpen={isRegisteredModalOpen}
        onClose={() => {
          setIsRegisteredModalOpen(false);
          setEditingRegisteredProduct(null);
        }}
        onSave={handleSaveRegisteredProduct}
        initialProduct={editingRegisteredProduct}
      />

      {/* Modal: Educational GGF & Tax Guide */}
      <GgfTaxGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
