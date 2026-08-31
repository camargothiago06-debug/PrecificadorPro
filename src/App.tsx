import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductFormModal } from './components/ProductFormModal';
import { CashFlowDashboard } from './components/CashFlowDashboard';
import { GgfTaxGuideModal } from './components/GgfTaxGuideModal';
import { ProductItem } from './types';
import { defaultProducts } from './data/defaultData';
import { exportProductsToCSV } from './utils/exportUtils';
import { RotateCcw, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'precificador_pro_products_v1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'catalog' | 'cashflow'>('catalog');

  // Products State with localStorage persistence
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Handlers
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDuplicateProduct = (product: ProductItem) => {
    const duplicated: ProductItem = {
      ...product,
      id: `prod-${Date.now()}`,
      code: `${product.code}-COP`,
      name: `${product.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts([duplicated, ...products]);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleUpdateManualPrice = (id: string, newPrice: number | undefined) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            manualSalePrice: newPrice,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const handleSaveProduct = (productToSave: ProductItem) => {
    if (editingProduct) {
      // Update existing
      setProducts(products.map((p) => (p.id === productToSave.id ? productToSave : p)));
    } else {
      // Add new
      setProducts([productToSave, ...products]);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar os produtos de exemplo originais? As alterações locais serão substituídas.')) {
      setProducts(defaultProducts);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProduct={handleOpenNewProduct}
        onOpenGuide={() => setIsGuideOpen(true)}
        onExportCSV={() => exportProductsToCSV(products)}
        productCount={products.length}
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
            onExportCSV={() => exportProductsToCSV(products)}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashFlowDashboard products={products} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 mt-auto print:hidden">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-800 text-base">Precificador Pro</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-600">Formação de Preço Contábil (Markup Divisor & GGF) & Fluxo de Caixa</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDefaults}
              className="hover:text-slate-900 flex items-center gap-1.5 text-xs text-slate-500 hover:underline font-semibold"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Exemplos</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400">Todos os cálculos em conformidade contábil e fiscal</span>
          </div>
        </div>
      </footer>

      {/* Modal: Product Pricing Studio / Form */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Modal: Educational GGF & Tax Guide */}
      <GgfTaxGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
