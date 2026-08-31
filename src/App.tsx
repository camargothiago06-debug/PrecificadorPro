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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Precificador Pro</span>
            <span>•</span>
            <span>Formação de Preço Contábil (Markup Divisor & GGF) & Fluxo de Caixa</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="hover:text-slate-800 flex items-center gap-1 text-[11px] text-slate-400 hover:underline"
              title="Restaurar dados de exemplo"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar Exemplos</span>
            </button>
            <span>•</span>
            <span>Todos os cálculos em conformidade contábil e fiscal</span>
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
