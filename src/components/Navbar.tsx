import React from 'react';
import { 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  FileSpreadsheet, 
  Plus, 
  BookOpen, 
  Download,
  HelpCircle,
  Layers,
  Package
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'registered' | 'cashflow';
  setActiveTab: (tab: 'catalog' | 'registered' | 'cashflow') => void;
  onNewProduct: () => void;
  onNewRegisteredProduct?: () => void;
  onOpenGuide: () => void;
  onExportCSV: () => void;
  productCount: number;
  registeredProductCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewProduct,
  onNewRegisteredProduct,
  onOpenGuide,
  onExportCSV,
  productCount,
  registeredProductCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-xl">Precificador Pro</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  GGF & Impostos
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 hidden sm:block">
                Formação de Preço de Venda & Fluxo de Caixa
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/70">
            <button
              id="tab-catalog-btn"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4.5 h-4.5 text-emerald-600" />
              <span>Formação de Preço</span>
              <span className="ml-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {productCount}
              </span>
            </button>

            <button
              id="tab-registered-btn"
              onClick={() => setActiveTab('registered')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'registered'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Package className="w-4.5 h-4.5 text-indigo-600" />
              <span>Cadastro de Produtos</span>
              <span className="ml-1 bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {registeredProductCount}
              </span>
            </button>

            <button
              id="tab-cashflow-btn"
              onClick={() => setActiveTab('cashflow')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'cashflow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5 text-purple-600" />
              <span>Fluxo de Caixa</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <button
              id="guide-btn"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              title="Entenda GGF, Markup e Impostos"
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Guia GGF & Markup</span>
            </button>

            <button
              id="export-csv-top-btn"
              onClick={onExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 hidden lg:inline-flex cursor-pointer"
              title="Exportar dados para Excel / CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exportar</span>
            </button>

            {activeTab === 'registered' ? (
              <button
                id="new-registered-product-header-btn"
                onClick={onNewRegisteredProduct || onNewProduct}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Cadastrar Produto</span>
              </button>
            ) : (
              <button
                id="new-product-header-btn"
                onClick={onNewProduct}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Novo Preço</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 py-2.5">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg ${
              activeTab === 'catalog' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            <span>Precificação ({productCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg ${
              activeTab === 'registered' ? 'text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            <Package className="w-4.5 h-4.5" />
            <span>Cadastro ({registeredProductCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex flex-col items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg ${
              activeTab === 'cashflow' ? 'text-purple-700 font-bold bg-purple-50' : 'text-slate-600'
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5" />
            <span>Fluxo Caixa</span>
          </button>
        </div>
      </div>
    </header>
  );
};
