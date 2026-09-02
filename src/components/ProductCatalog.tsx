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
  FileSpreadsheet,
  Scale
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
  onUpdateMargin?: (id: string, newMargin: number) => void;
  onExportCSV: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onNewProduct,
  onEditProduct,
  onDuplicateProduct,
  onDeleteProduct,
  onUpdateManualPrice,
  onUpdateMargin,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'margin_desc' | 'margin_asc' | 'price_desc' | 'profit_desc' | 'volume_desc' | 'price_kg_desc' | 'cost_kg_desc'>('margin_desc');
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
    let totalMonthlyKg = 0;

    products.forEach((product) => {
      const calc = calculateProductPricing(product);
      const volumeKg = product.targetSalesVolume || 0;
      totalMonthlyKg += volumeKg;
      totalMonthlyRevenue += volumeKg * calc.effectiveSalePrice;
      totalMonthlyNetProfit += volumeKg * calc.netProfitAmount;
      totalMonthlyDirectCosts += volumeKg * calc.totalDirectCosts;
      totalMonthlyGgf += volumeKg * calc.totalGgfUnitCost;
      totalMonthlyTaxes += volumeKg * calc.taxesAmount;
    });

    const averageMarginRate = totalMonthlyRevenue > 0 
      ? (totalMonthlyNetProfit / totalMonthlyRevenue) * 100 
      : 0;

    const averageGgfPerKg = totalMonthlyKg > 0
      ? totalMonthlyGgf / totalMonthlyKg
      : 0;

    return {
      totalMonthlyRevenue,
      totalMonthlyNetProfit,
      totalMonthlyDirectCosts,
      totalMonthlyGgf,
      totalMonthlyTaxes,
      totalMonthlyKg,
      averageMarginRate,
      averageGgfPerKg,
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
        if (sortBy === 'price_kg_desc') return calcB.effectiveSalePricePerKg - calcA.effectiveSalePricePerKg;
        if (sortBy === 'cost_kg_desc') return calcB.totalCostPerKg - calcA.totalCostPerKg;
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
    <div className="space-y-7">
      {/* Portfolio Overview KPI Ribbon - Highlighted and Enlarged */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Faturamento Total */}
        <div className="bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white p-6 rounded-3xl border-2 border-blue-200/80 shadow-xs hover:shadow-md hover:border-blue-400/90 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-blue-900 uppercase tracking-wider">
                Faturamento Previsto
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl lg:text-[2rem] font-black text-slate-950 font-mono tracking-tight">
              {formatCurrencyBRL(portfolioSummary.totalMonthlyRevenue)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-blue-100/80 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 text-blue-900 font-semibold">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Volume Total:</span>
            </span>
            <span className="flex items-center gap-1 text-slate-900 font-mono font-black">
              <span>{portfolioSummary.totalMonthlyKg.toLocaleString('pt-BR')} kg/mês</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Lucro Líquido Previsto */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white p-6 rounded-3xl border-2 border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-400/90 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-900 uppercase tracking-wider">
                Lucro Líquido Previsto
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl lg:text-[2rem] font-black text-emerald-700 font-mono tracking-tight">
              {formatCurrencyBRL(portfolioSummary.totalMonthlyNetProfit)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-100/80 flex items-center gap-1.5 text-xs sm:text-sm text-emerald-800 font-semibold">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Margem líquida média: <b className="font-mono font-black">{formatPercent(portfolioSummary.averageMarginRate)}</b></span>
          </div>
        </div>

        {/* KPI 3: Custos de Produção (Diretos + GGF) */}
        <div className="bg-gradient-to-br from-purple-500/10 via-purple-50/40 to-white p-6 rounded-3xl border-2 border-purple-200/80 shadow-xs hover:shadow-md hover:border-purple-400/90 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-purple-900 uppercase tracking-wider">
                Custos Produção + GGF
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl lg:text-[2rem] font-black text-purple-950 font-mono tracking-tight">
              {formatCurrencyBRL(portfolioSummary.totalMonthlyDirectCosts + portfolioSummary.totalMonthlyGgf)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-purple-100/80 flex items-center justify-between text-xs sm:text-sm text-slate-600 font-medium">
            <span>GGF indireto: <b className="text-purple-700 font-mono font-bold">{formatCurrencyBRL(portfolioSummary.totalMonthlyGgf)}</b></span>
            <span className="text-purple-700 font-mono text-xs">({formatCurrencyBRL(portfolioSummary.averageGgfPerKg)}/kg)</span>
          </div>
        </div>

        {/* KPI 4: Impostos a Recolher */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-50/40 to-white p-6 rounded-3xl border-2 border-rose-200/80 shadow-xs hover:shadow-md hover:border-rose-400/90 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-rose-900 uppercase tracking-wider">
                Impostos Previstos
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl lg:text-[2rem] font-black text-rose-700 font-mono tracking-tight">
              {formatCurrencyBRL(portfolioSummary.totalMonthlyTaxes)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100/80 text-xs sm:text-sm text-slate-600 font-medium truncate">
            Simples / ICMS / PIS / COFINS provisionados
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            id="product-search-input"
            type="text"
            placeholder="Buscar por nome, código ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs sm:text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Todas as Categorias ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs sm:text-sm">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="margin_desc">Maior Margem (%)</option>
              <option value="margin_asc">Menor Margem (%)</option>
              <option value="profit_desc">Maior Lucro Mensal (R$)</option>
              <option value="price_desc">Maior Preço / un (R$)</option>
              <option value="price_kg_desc">Maior Preço / kg (R$/kg)</option>
              <option value="cost_kg_desc">Maior Custo / kg (R$/kg)</option>
              <option value="volume_desc">Maior Volume (un)</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Tabela Comparativa"
            >
              <TableIcon className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* New Product Action */}
          <button
            id="new-product-catalog-btn"
            onClick={onNewProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-14 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Tente alterar os termos de busca ou filtros selecionados.'
              : 'Comece adicionando seu primeiro produto ou insumo para formar o preço de venda.'}
          </p>
          <button
            onClick={onNewProduct}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-colors cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Cadastrar Primeiro Produto</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDuplicate={onDuplicateProduct}
              onDelete={onDeleteProduct}
              onUpdateManualPrice={onUpdateManualPrice}
              onUpdateMargin={onUpdateMargin}
            />
          ))}
        </div>
      ) : (
        /* Detailed Comparative Financial Table */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Tabela Comparativa de Custos, GGF por Kg, Impostos e Preços
            </h3>
            <button
              onClick={onExportCSV}
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-sans">Item / Código</th>
                  <th className="py-3.5 px-3 text-right">Custos Diretos (R$/kg)</th>
                  <th className="py-3.5 px-3 text-right">GGF (R$/kg)</th>
                  <th className="py-3.5 px-3 text-right">Desp. Fixas (R$/kg)</th>
                  <th className="py-3.5 px-3 text-right">Custo Total (R$/kg)</th>
                  <th className="py-3.5 px-3 text-right">Impostos %</th>
                  <th className="py-3.5 px-3 text-right">Comissões %</th>
                  <th className="py-3.5 px-3 text-right font-bold text-slate-950">Preço Venda (R$/kg)</th>
                  <th className="py-3.5 px-3 text-right">Margem Líq. %</th>
                  <th className="py-3.5 px-3 text-right">Lucro (R$/kg)</th>
                  <th className="py-3.5 px-3 text-right font-sans">Volume (kg/mês)</th>
                  <th className="py-3.5 px-3 text-right text-emerald-800">Lucro Mês (R$)</th>
                  <th className="py-3.5 px-4 text-center font-sans">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs sm:text-sm">
                {filteredProducts.map((product) => {
                  const calc = calculateProductPricing(product);
                  const monthlyProfit = (product.targetSalesVolume || 0) * calc.netProfitAmount;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-900">
                        <div className="font-bold text-sm text-slate-950">{product.name}</div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                          <span>{product.code}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-sans">{product.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-blue-700 font-semibold">
                        <div>{formatCurrencyBRL(calc.totalDirectCosts)}/kg</div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-purple-700 font-semibold">
                        <div>{formatCurrencyBRL(calc.totalGgfUnitCost)}/kg</div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600">
                        <div>{formatCurrencyBRL(calc.totalFixedExpensesUnit)}/kg</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        <div className="text-indigo-700 font-bold">{formatCurrencyBRL(calc.totalCostPerKg)}/kg</div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-rose-600 font-semibold">
                        {formatPercent(calc.totalTaxRate)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-amber-600 font-semibold">
                        {formatPercent(calc.totalVariableRate)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-slate-950 bg-emerald-50/60 text-sm">
                        <div className="text-emerald-800 font-bold">{formatCurrencyBRL(calc.effectiveSalePrice)}/kg</div>
                      </td>
                      <td className={`py-3.5 px-3 text-right font-black ${
                        calc.netProfitRate >= 15 ? 'text-emerald-700' : calc.netProfitRate > 0 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {formatPercent(calc.netProfitRate)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-emerald-700 font-bold">
                        <div>+{formatCurrencyBRL(calc.netProfitAmount)}/kg</div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-700 font-bold">
                        <div>{(product.targetSalesVolume || 0).toLocaleString('pt-BR')} kg</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-700">
                        {formatCurrencyBRL(monthlyProfit)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
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
