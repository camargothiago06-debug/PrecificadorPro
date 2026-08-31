import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  LayoutGrid, 
  Table as TableIcon, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Percent,
  Sliders,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { ProductItem } from '../types';
import { ProductCard } from './ProductCard';
import { calculateProductPricing, formatCurrencyBRL, formatPercent } from '../utils/pricingCalculator';

interface ProductCatalogProps {
  products: ProductItem[];
  onNewProduct: () => void;
  onEditProduct: (product: ProductItem) => void;
  onDuplicateProduct: (product: ProductItem) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateManualPrice: (id: string, newPrice: number | undefined) => void;
  onExportCSV: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onNewProduct,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onUpdateManualPrice,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'margin_desc' | 'margin_asc' | 'price_desc' | 'profit_desc' | 'volume_desc'>('margin_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Overall Portfolio KPI calculations
  const portfolioSummary = useMemo(() => {
    let totalMonthlyRevenue = 0;
    let totalMonthlyNetProfit = 0;
    let totalMonthlyDirectCosts = 0;
    let totalMonthlyGgf = 0;
    let totalMonthlyTaxes = 0;
    let totalMonthlyUnits = 0;

    products.forEach((product) => {
      const calc = calculateProductPricing(product);
      const volume = product.targetSalesVolume || 0;
      totalMonthlyUnits += volume;
      totalMonthlyRevenue += volume * calc.effectiveSalePrice;
      totalMonthlyNetProfit += volume * calc.netProfitAmount;
      totalMonthlyDirectCosts += volume * calc.totalDirectCosts;
      totalMonthlyGgf += volume * calc.totalGgfUnitCost;
      totalMonthlyTaxes += volume * calc.taxesAmount;
    });

    const averageMarginRate = totalMonthlyRevenue > 0 
      ? (totalMonthlyNetProfit / totalMonthlyRevenue) * 100 
      : 0;

    return {
      totalMonthlyRevenue,
      totalMonthlyNetProfit,
      totalMonthlyDirectCosts,
      totalMonthlyGgf,
      totalMonthlyTaxes,
      totalMonthlyUnits,
      averageMarginRate,
    };
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const calcA = calculateProductPricing(a);
        const calcB = calculateProductPricing(b);

        if (sortBy === 'margin_desc') return calcB.netProfitRate - calcA.netProfitRate;
        if (sortBy === 'margin_asc') return calcA.netProfitRate - calcB.netProfitRate;
        if (sortBy === 'price_desc') return calcB.effectiveSalePrice - calcA.effectiveSalePrice;
        if (sortBy === 'profit_desc') {
          const profitA = (a.targetSalesVolume || 0) * calcA.netProfitAmount;
          const profitB = (b.targetSalesVolume || 0) * calcB.netProfitAmount;
          return profitB - profitA;
        }
        if (sortBy === 'volume_desc') return (b.targetSalesVolume || 0) - (a.targetSalesVolume || 0);
        return a.name.localeCompare(b.name);
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faturamento Mensal Previsto
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatCurrencyBRL(portfolioSummary.totalMonthlyRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>Volume total: <b className="text-slate-700 font-mono">{portfolioSummary.totalMonthlyUnits}</b> un/mês</span>
          </div>
        </div>

        {/* KPI 2: Lucro Líquido Previsto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lucro Líquido Previsto
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {formatCurrencyBRL(portfolioSummary.totalMonthlyNetProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <Percent className="w-3.5 h-3.5" />
            <span>Margem líquida média: <b className="font-mono">{formatPercent(portfolioSummary.averageMarginRate)}</b></span>
          </div>
        </div>

        {/* KPI 3: Custos de Produção (Diretos + GGF) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Custos Produção + GGF
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatCurrencyBRL(portfolioSummary.totalMonthlyDirectCosts + portfolioSummary.totalMonthlyGgf)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            GGF fábrica: <b className="text-purple-700 font-mono">{formatCurrencyBRL(portfolioSummary.totalMonthlyGgf)}</b>/mês
          </div>
        </div>

        {/* KPI 4: Impostos a Recolher */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Impostos Previstos
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 font-mono tracking-tight">
            {formatCurrencyBRL(portfolioSummary.totalMonthlyTaxes)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Simples / ICMS / PIS / COFINS provisionados
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="product-search-input"
            type="text"
            placeholder="Buscar por nome, código ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Todas as Categorias ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="margin_desc">Maior Margem (%)</option>
              <option value="margin_asc">Menor Margem (%)</option>
              <option value="profit_desc">Maior Lucro Mensal (R$)</option>
              <option value="price_desc">Maior Preço (R$)</option>
              <option value="volume_desc">Maior Volume (un)</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Tabela Comparativa"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* New Product Action */}
          <button
            id="new-product-catalog-btn"
            onClick={onNewProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Tente alterar os termos de busca ou filtros selecionados.'
              : 'Comece adicionando seu primeiro produto ou insumo para formar o preço de venda.'}
          </p>
          <button
            onClick={onNewProduct}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Produto</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDuplicate={onDuplicateProduct}
              onDelete={onDeleteProduct}
              onUpdateManualPrice={onUpdateManualPrice}
            />
          ))}
        </div>
      ) : (
        /* Detailed Comparative Financial Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Tabela Comparativa de Custos, GGF, Impostos e Preços
            </h3>
            <button
              onClick={onExportCSV}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item / Código</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-3 text-right">Custos Diretos</th>
                  <th className="py-3 px-3 text-right">GGF Indireto</th>
                  <th className="py-3 px-3 text-right">Desp. Fixas</th>
                  <th className="py-3 px-3 text-right">Custo Total</th>
                  <th className="py-3 px-3 text-right">Impostos %</th>
                  <th className="py-3 px-3 text-right">Comissões %</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900">Preço Venda</th>
                  <th className="py-3 px-3 text-right">Margem Líq. %</th>
                  <th className="py-3 px-3 text-right">Lucro Unit (R$)</th>
                  <th className="py-3 px-3 text-right">Vol/Mês</th>
                  <th className="py-3 px-3 text-right">Lucro Mês (R$)</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredProducts.map((product) => {
                  const calc = calculateProductPricing(product);
                  const monthlyProfit = (product.targetSalesVolume || 0) * calc.netProfitAmount;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        <div className="font-bold">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{product.code}</div>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-blue-700">
                        {formatCurrencyBRL(calc.totalDirectCosts)}
                      </td>
                      <td className="py-3 px-3 text-right text-purple-700">
                        {formatCurrencyBRL(calc.totalGgfUnitCost)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {formatCurrencyBRL(calc.totalFixedExpensesUnit)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrencyBRL(calc.totalUnitCost)}
                      </td>
                      <td className="py-3 px-3 text-right text-rose-600">
                        {formatPercent(calc.totalTaxRate)}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-600">
                        {formatPercent(calc.totalVariableRate)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-950 bg-emerald-50/50 text-xs">
                        {formatCurrencyBRL(calc.effectiveSalePrice)}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${
                        calc.netProfitRate >= 15 ? 'text-emerald-600' : calc.netProfitRate > 0 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {formatPercent(calc.netProfitRate)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                        {formatCurrencyBRL(calc.netProfitAmount)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {product.targetSalesVolume}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {formatCurrencyBRL(monthlyProfit)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
