import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Percent, 
  DollarSign, 
  Edit3, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Calculator, 
  Download, 
  Upload, 
  Layers,
  Sparkles,
  Scale,
  Building,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { RegisteredProductItem } from '../types';
import { formatCurrencyBRL, formatPercent } from '../utils/pricingCalculator';

interface RegisteredProductsCatalogProps {
  products: RegisteredProductItem[];
  onNewProduct: () => void;
  onEditProduct: (product: RegisteredProductItem) => void;
  onDuplicateProduct: (product: RegisteredProductItem) => void;
  onDeleteProduct: (id: string) => void;
  onCreatePricing: (product: RegisteredProductItem) => void;
}

export const RegisteredProductsCatalog: React.FC<RegisteredProductsCatalogProps> = ({
  products,
  onNewProduct,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onCreatePricing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalPrice' | 'taxRate' | 'netPrice' | 'recent'>('recent');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });

    return result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'totalPrice') return b.totalPrice - a.totalPrice;
      if (sortBy === 'taxRate') return b.taxRate - a.taxRate;
      if (sortBy === 'netPrice') return b.netPrice - a.netPrice;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCount = products.length;
    if (totalCount === 0) {
      return { totalCount: 0, avgTotal: 0, avgTax: 0, avgNet: 0, totalTaxDeduction: 0 };
    }
    const sumTotal = products.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
    const sumTaxRate = products.reduce((acc, p) => acc + (p.taxRate || 0), 0);
    const sumTaxAmt = products.reduce((acc, p) => acc + (p.taxAmount || 0), 0);
    const sumNet = products.reduce((acc, p) => acc + (p.netPrice || 0), 0);

    return {
      totalCount,
      avgTotal: sumTotal / totalCount,
      avgTax: sumTaxRate / totalCount,
      avgNet: sumNet / totalCount,
      totalTaxDeduction: sumTaxAmt,
    };
  }, [products]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Nome do Produto',
      'Categoria',
      'Unidade',
      'Peso Unitário (kg)',
      'Valor Total Bruto (R$)',
      'Alíquota Imposto (%)',
      'Valor Imposto (R$)',
      'Preço Líquido (R$)',
      'Fornecedor',
      'Observações',
    ];

    const rows = products.map((p) => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.defaultWeightKg || 1,
      p.totalPrice.toFixed(2),
      p.taxRate.toFixed(2),
      p.taxAmount.toFixed(2),
      p.netPrice.toFixed(2),
      `"${(p.supplier || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `produtos_cadastrados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              Cadastro Mestre de Produtos & Impostos
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Produtos & Insumos Base
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Deixe cadastrado cada produto com seu <strong>Valor Total</strong> e sua <strong>Alíquota de Imposto específica</strong>. O sistema calcula automaticamente o <strong>Preço Líquido</strong> e permite puxar esses dados instantaneamente na formação de preço.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onNewProduct}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* 4 Key Stat Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total de Produtos</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-white">
              {stats.totalCount} <span className="text-xs text-slate-400 font-normal">itens</span>
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Valor Total Médio (Bruto)</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-white">
              {formatCurrencyBRL(stats.avgTotal)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Alíquota Média de Imposto</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-rose-400">
              {formatPercent(stats.avgTax)}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <span className="text-[11px] font-semibold text-emerald-300 block mb-1">Preço Líquido Médio</span>
            <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
              {formatCurrencyBRL(stats.avgNet)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, código, fornecedor ou descrição..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas as Categorias ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="recent">Mais Recentes</option>
            <option value="name">Nome (A-Z)</option>
            <option value="totalPrice">Maior Valor Total</option>
            <option value="taxRate">Maior Imposto (%)</option>
            <option value="netPrice">Maior Preço Líquido</option>
          </select>
        </div>
      </div>

      {/* Products Grid / Table */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Nenhum produto cadastrado encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm || selectedCategory !== 'all'
                ? 'Nenhum resultado corresponde aos filtros selecionados. Tente limpar a busca.'
                : 'Cadastre seu primeiro produto informando o valor total e o percentual de imposto para ver o cálculo do preço líquido.'}
            </p>
          </div>
          <button
            onClick={onNewProduct}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3.5">
                {/* Header item */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {item.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Actions Dropdown / buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onDuplicateProduct(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Duplicar Produto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditProduct(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar Produto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Financial Value Box */}
                <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Valor Total Bruto:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {formatCurrencyBRL(item.totalPrice)} <span className="text-[10px] text-slate-400 font-normal">/{item.unit}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Percent className="w-3 h-3 text-rose-500" />
                      Imposto ({formatPercent(item.taxRate)}):
                    </span>
                    <span className="font-mono font-bold text-rose-600">
                      -{formatCurrencyBRL(item.taxAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200/90 bg-emerald-50/80 -mx-3.5 -mb-3.5 p-3 rounded-b-xl border-t-emerald-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Preço Líquido:</span>
                      <span className="text-[10px] text-emerald-800 font-medium font-mono">
                        ({item.unit} = {item.defaultWeightKg || 1} kg)
                      </span>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-base">
                      {formatCurrencyBRL(item.netPrice)}
                    </span>
                  </div>
                </div>

                {item.supplier && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>Fornecedor: <strong className="text-slate-700">{item.supplier}</strong></span>
                  </div>
                )}
              </div>

              {/* Action: Use in Pricing Engine */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  Pronto para precificação
                </span>
                <button
                  onClick={() => onCreatePricing(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-200 hover:border-indigo-600 cursor-pointer shadow-2xs group-hover:bg-indigo-600 group-hover:text-white"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Formar Preço</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
