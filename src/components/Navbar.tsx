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
  Layers
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'cashflow';
  setActiveTab: (tab: 'catalog' | 'cashflow') => void;
  onNewProduct: () => void;
  onOpenGuide: () => void;
  onExportCSV: () => void;
  productCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewProduct,
  onOpenGuide,
  onExportCSV,
  productCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">Precificador Pro</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  GGF & Impostos
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Formação de Preço de Venda & Fluxo de Caixa
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              id="tab-catalog-btn"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Produtos & Preços</span>
              <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {productCount}
              </span>
            </button>

            <button
              id="tab-cashflow-btn"
              onClick={() => setActiveTab('cashflow')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cashflow'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Fluxo de Caixa Previsto</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              id="guide-btn"
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Entenda GGF, Markup e Impostos"
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Guia GGF & Markup</span>
            </button>

            <button
              id="export-csv-top-btn"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 hidden lg:inline-flex"
              title="Exportar dados para Excel / CSV"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exportar</span>
            </button>

            <button
              id="new-product-header-btn"
              onClick={onNewProduct}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 py-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg ${
              activeTab === 'catalog' ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Produtos ({productCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg ${
              activeTab === 'cashflow' ? 'text-indigo-700 font-bold bg-indigo-50' : 'text-slate-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Fluxo de Caixa</span>
          </button>
        </div>
      </div>
    </header>
  );
};
