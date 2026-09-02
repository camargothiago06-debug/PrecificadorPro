import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Copy, 
  Trash2, 
  TrendingUp, 
  Percent, 
  Package, 
  Building2, 
  Receipt, 
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Clock,
  Scale
} from 'lucide-react';
import { ProductItem } from '../types';
import { calculateProductPricing, formatCurrencyBRL, formatPercent, formatKg, formatCurrencyPerKg } from '../utils/pricingCalculator';
import { formatTermDisplay } from '../utils/paymentTerms';

interface ProductCardProps {
  product: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDuplicate: (product: ProductItem) => void;
  onDelete: (id: string) => void;
  onUpdateManualPrice: (id: string, newPrice: number | undefined) => void;
  onUpdateMargin?: (id: string, newMargin: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateManualPrice,
  onUpdateMargin,
}) => {
  const calc = calculateProductPricing(product);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedPrice, setSimulatedPrice] = useState<number>(calc.effectiveSalePrice);
  const [simulatedMargin, setSimulatedMargin] = useState<number>(product.desiredProfitMargin ?? 22.0);

  useEffect(() => {
    setSimulatedPrice(calc.effectiveSalePrice);
    setSimulatedMargin(product.desiredProfitMargin ?? 22.0);
  }, [calc.effectiveSalePrice, product.desiredProfitMargin]);

  const isHealthyMargin = calc.netProfitRate >= 15;
  const isWarningMargin = calc.netProfitRate > 0 && calc.netProfitRate < 15;
  const isLossMargin = calc.netProfitRate <= 0;

  const monthlyVolumeKg = product.targetSalesVolume || 0;
  const monthlyRevenue = monthlyVolumeKg * calc.effectiveSalePrice;
  const monthlyNetProfit = monthlyVolumeKg * calc.netProfitAmount;

  // Percentage breakdown of price per kg
  const price = calc.effectiveSalePrice > 0 ? calc.effectiveSalePrice : 1;
  const directPct = Math.min(100, (calc.totalDirectCosts / price) * 100);
  const ggfPct = Math.min(100, (calc.totalGgfUnitCost / price) * 100);
  const fixedPct = Math.min(100, (calc.totalFixedExpensesUnit / price) * 100);
  const taxPct = Math.min(100, (calc.taxesAmount / price) * 100);
  const varPct = Math.min(100, (calc.variableExpensesAmount / price) * 100);
  const profitPct = Math.max(0, (calc.netProfitAmount / price) * 100);

  const handlePriceChange = (val: number) => {
    setSimulatedPrice(val);
    onUpdateManualPrice(product.id, val);
  };

  const handleMarginChange = (val: number) => {
    setSimulatedMargin(val);
    if (onUpdateMargin) {
      onUpdateMargin(product.id, val);
    }
  };

  const handleResetPrice = () => {
    setSimulatedPrice(calc.suggestedSalePrice);
    setSimulatedMargin(product.desiredProfitMargin ?? 22.0);
    onUpdateManualPrice(product.id, undefined);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono font-extrabold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
                {product.code || 'ITEM'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                Unidade: Kilograma (kg)
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200/80 truncate max-w-[160px]">
                {product.category || 'Geral'}
              </span>
              {product.taxSettings?.regime === 'lucro_real' && (
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Lucro Real
                </span>
              )}
              {calc.rawMaterialTaxCreditsAmount > 0 && (
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200" title="Aproveitamento de créditos de PIS/COFINS/ICMS nos insumos por kg">
                  Créditos: +{formatCurrencyBRL(calc.rawMaterialTaxCreditsAmount)}/kg
                </span>
              )}
              {isHealthyMargin && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Margem Saudável
                </span>
              )}
              {isWarningMargin && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Margem Apertada
                </span>
              )}
              {isLossMargin && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Prejuízo
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-slate-950 text-lg leading-snug line-clamp-1" title={product.name}>
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 mt-0.5">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              title="Editar Composição & Custos (R$/kg)"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => onDuplicate(product)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
              title="Duplicar Produto"
            >
              <Copy className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Excluir"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Pricing Highlight Hero (All in R$/kg) */}
        <div className="mt-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>{product.manualSalePrice ? 'Preço Praticado' : 'Preço de Venda'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-mono flex items-baseline gap-1.5">
              <span>{formatCurrencyBRL(calc.effectiveSalePrice)}</span>
              <span className="text-sm font-extrabold text-emerald-700 font-sans">/ kg</span>
            </div>
            {product.manualSalePrice && (
              <div className="text-xs text-slate-500 mt-0.5">
                Sugerido: <span className="font-mono font-bold text-slate-700">{formatCurrencyBRL(calc.suggestedSalePrice)}/kg</span>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Margem Líquida Real
            </div>
            <div className={`text-2xl font-black font-mono ${
              calc.netProfitRate >= 15 ? 'text-emerald-700' : calc.netProfitRate > 0 ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {formatPercent(calc.netProfitRate)}
            </div>
            <div className="text-xs font-bold text-slate-600 font-mono flex sm:justify-end gap-1">
              <span>Lucro:</span>
              <span className="text-emerald-700 font-extrabold">+{formatCurrencyBRL(calc.netProfitAmount)}/kg</span>
            </div>
          </div>
        </div>

        {/* Visual Composition Stacked Bar in R$/kg */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-bold">
            <span>Composição do Preço por Quilograma (R$/kg)</span>
            <span className="font-mono text-slate-900">100%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden gap-0.5 p-0.5 border border-slate-200/60">
            <div 
              style={{ width: `${directPct}%` }} 
              className="bg-blue-500 rounded-xs transition-all" 
              title={`Custos Diretos: ${formatPercent(directPct)} (${formatCurrencyBRL(calc.totalDirectCosts)}/kg)`} 
            />
            <div 
              style={{ width: `${ggfPct}%` }} 
              className="bg-purple-500 rounded-xs transition-all" 
              title={`GGF Indireto: ${formatPercent(ggfPct)} (${formatCurrencyBRL(calc.totalGgfUnitCost)}/kg)`} 
            />
            <div 
              style={{ width: `${fixedPct}%` }} 
              className="bg-slate-400 rounded-xs transition-all" 
              title={`Despesas Fixas: ${formatPercent(fixedPct)} (${formatCurrencyBRL(calc.totalFixedExpensesUnit)}/kg)`} 
            />
            <div 
              style={{ width: `${taxPct}%` }} 
              className="bg-rose-400 rounded-xs transition-all" 
              title={`Impostos: ${formatPercent(taxPct)} (${formatCurrencyBRL(calc.taxesAmount)}/kg)`} 
            />
            <div 
              style={{ width: `${varPct}%` }} 
              className="bg-amber-400 rounded-xs transition-all" 
              title={`Taxas & Comissões: ${formatPercent(varPct)} (${formatCurrencyBRL(calc.variableExpensesAmount)}/kg)`} 
            />
            <div 
              style={{ width: `${profitPct}%` }} 
              className="bg-emerald-500 rounded-xs transition-all" 
              title={`Lucro Líquido: ${formatPercent(profitPct)} (${formatCurrencyBRL(calc.netProfitAmount)}/kg)`} 
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mt-2 gap-x-2 gap-y-1">
            <span className="flex items-center gap-1.5 font-medium" title="Custos Diretos por kg">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Diretos: <b className="text-slate-900 font-mono font-bold">{formatCurrencyBRL(calc.totalDirectCosts)}/kg</b>
            </span>
            <span className="flex items-center gap-1.5 font-medium" title="GGF Rateado por kg">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> GGF: <b className="text-slate-900 font-mono font-bold">{formatCurrencyBRL(calc.totalGgfUnitCost)}/kg</b>
            </span>
            <span className="flex items-center gap-1.5 font-medium" title="Custo Integral Total por kg">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Custo Total: <b className="text-slate-900 font-mono font-bold">{formatCurrencyBRL(calc.totalUnitCost)}/kg</b>
            </span>
          </div>
        </div>

        {/* Detailed Financial Key Metrics Matrix in Kilograms */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-xl text-center">
            <div className="text-[11px] text-slate-500 font-semibold">Margem Contribuição</div>
            <div className="text-sm font-black text-slate-950 font-mono mt-0.5">
              {formatPercent(calc.contributionMarginRate)}
            </div>
            <div className="text-xs text-emerald-700 font-mono font-bold">
              {formatCurrencyBRL(calc.contributionMarginAmount)}/kg
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl text-center">
            <div className="text-[11px] text-slate-500 font-semibold">Ponto de Equilíbrio</div>
            <div className="text-sm font-black text-slate-950 font-mono mt-0.5">
              {formatKg(calc.breakEvenKg, 0)}/mês
            </div>
            <div className="text-xs text-slate-500 font-mono font-medium">
              {formatCurrencyBRL(calc.breakEvenRevenue)}/mês
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl text-center">
            <div className="text-[11px] text-slate-500 font-semibold">Custo Total / kg</div>
            <div className="text-sm font-black text-indigo-700 font-mono mt-0.5">
              {formatCurrencyBRL(calc.totalCostPerKg)}/kg
            </div>
            <div className="text-xs text-slate-500 font-mono font-medium">
              Markup: {calc.markupMultiplier.toFixed(2)}x
            </div>
          </div>
        </div>

        {/* Monthly Projection in Kilograms */}
        <div className="mt-3.5 flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Volume: <b className="font-mono font-bold text-slate-900">{formatKg(monthlyVolumeKg, 0)}/mês</b></span>
          </div>
          <div className="text-right">
            <span className="text-slate-600 text-xs font-medium">Lucro Mensal: </span>
            <span className="font-extrabold text-emerald-800 font-mono text-sm">{formatCurrencyBRL(monthlyNetProfit)}/mês</span>
          </div>
        </div>

        {/* Payment & Receipt Terms Indicator */}
        <div className="mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/90 border border-slate-200/80 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prazos Médios:</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold" title="Prazo Médio de Recebimento das Vendas">
              Receb: {formatTermDisplay(product.receivableTermsType || `${product.receivableDays || 30}d`, product.receivableInstallments, product.receivableDays)}
            </span>
            <span className="text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded font-bold" title="Prazo Médio de Pagamento aos Fornecedores">
              Pag: {formatTermDisplay(product.payableTermsType || `${product.payableDays || 15}d`, product.payableInstallments, product.payableDays)}
            </span>
          </div>
        </div>

        {/* Quick Simulator Collapse in R$/kg */}
        {showSimulator && (
          <div className="mt-3.5 p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 text-xs sm:text-sm transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" /> Simulador de Margem & Preço
              </span>
              <button
                onClick={handleResetPrice}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                Resetar p/ Sugerido
              </button>
            </div>

            {/* Margem Desejada Slider */}
            <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 text-xs font-bold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" /> Margem de Lucro Desejada:
                </span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {formatPercent(simulatedMargin)}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="0.5"
                value={simulatedMargin}
                onChange={(e) => handleMarginChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Preço de Venda Praticado Slider */}
            <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 text-xs font-bold flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" /> Preço de Venda (R$/kg):
                </span>
                <span className="font-mono font-black text-indigo-950 text-sm">
                  {formatCurrencyBRL(simulatedPrice)}/kg
                </span>
              </div>
              <input
                type="range"
                min={Math.max(1, Math.round(calc.totalUnitCost * 0.8))}
                max={Math.round(calc.suggestedSalePrice * 2.2)}
                step="0.10"
                value={simulatedPrice}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>Custo Integral: {formatCurrencyBRL(calc.totalUnitCost)}/kg</span>
              <span>Desconto Máx: {formatPercent(calc.maximumDiscountRate)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-200/70 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          <span>{showSimulator ? 'Fechar Simulador' : 'Simular Preço (R$/kg)'}</span>
        </button>

        <button
          onClick={() => onEdit(product)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer"
        >
          <span>Abrir Ficha Técnica por kg</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

