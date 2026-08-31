import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { ProductItem } from '../types';
import { calculateProductPricing, formatCurrencyBRL, formatPercent } from '../utils/pricingCalculator';

interface ProductCardProps {
  product: ProductItem;
  onEdit: (product: ProductItem) => void;
  onDuplicate: (product: ProductItem) => void;
  onDelete: (id: string) => void;
  onUpdateManualPrice: (id: string, newPrice: number | undefined) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateManualPrice,
}) => {
  const calc = calculateProductPricing(product);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedPrice, setSimulatedPrice] = useState<number>(calc.effectiveSalePrice);

  const isHealthyMargin = calc.netProfitRate >= 15;
  const isWarningMargin = calc.netProfitRate > 0 && calc.netProfitRate < 15;
  const isLossMargin = calc.netProfitRate <= 0;

  const monthlyRevenue = (product.targetSalesVolume || 0) * calc.effectiveSalePrice;
  const monthlyNetProfit = (product.targetSalesVolume || 0) * calc.netProfitAmount;

  // Percentage breakdown of price
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

  const handleResetPrice = () => {
    setSimulatedPrice(calc.suggestedSalePrice);
    onUpdateManualPrice(product.id, undefined);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {product.code || 'ITEM'}
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 truncate max-w-[160px]">
                {product.category || 'Geral'}
              </span>
              {isHealthyMargin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Margem Saudável
                </span>
              )}
              {isWarningMargin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> Margem Apertada
                </span>
              )}
              {isLossMargin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  <AlertTriangle className="w-3 h-3" /> Prejuízo
                </span>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1" title={product.name}>
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Editar Composição & Custos"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(product)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Duplicar Produto"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing Highlight Hero */}
        <div className="mt-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {product.manualSalePrice ? 'Preço Praticado (Manual)' : 'Preço de Venda Sugerido'}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrencyBRL(calc.effectiveSalePrice)}
            </div>
            {product.manualSalePrice && (
              <div className="text-[11px] text-slate-500">
                Sugerido no cálculo: <span className="font-mono">{formatCurrencyBRL(calc.suggestedSalePrice)}</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Margem Líquida
            </div>
            <div className={`text-xl font-extrabold font-mono ${
              calc.netProfitRate >= 15 ? 'text-emerald-600' : calc.netProfitRate > 0 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {formatPercent(calc.netProfitRate)}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 font-mono">
              +{formatCurrencyBRL(calc.netProfitAmount)} / un
            </div>
          </div>
        </div>

        {/* Visual Composition Stacked Bar */}
        <div className="mt-3.5">
          <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1.5 font-medium">
            <span>Composição do Preço</span>
            <span className="font-mono text-slate-700">100%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden gap-0.5 p-0.5 border border-slate-200/60">
            <div 
              style={{ width: `${directPct}%` }} 
              className="bg-blue-500 rounded-xs transition-all" 
              title={`Custos Diretos: ${formatPercent(directPct)} (${formatCurrencyBRL(calc.totalDirectCosts)})`} 
            />
            <div 
              style={{ width: `${ggfPct}%` }} 
              className="bg-purple-500 rounded-xs transition-all" 
              title={`GGF Indireto: ${formatPercent(ggfPct)} (${formatCurrencyBRL(calc.totalGgfUnitCost)})`} 
            />
            <div 
              style={{ width: `${fixedPct}%` }} 
              className="bg-slate-400 rounded-xs transition-all" 
              title={`Despesas Fixas: ${formatPercent(fixedPct)} (${formatCurrencyBRL(calc.totalFixedExpensesUnit)})`} 
            />
            <div 
              style={{ width: `${taxPct}%` }} 
              className="bg-rose-400 rounded-xs transition-all" 
              title={`Impostos: ${formatPercent(taxPct)} (${formatCurrencyBRL(calc.taxesAmount)})`} 
            />
            <div 
              style={{ width: `${varPct}%` }} 
              className="bg-amber-400 rounded-xs transition-all" 
              title={`Taxas & Comissões: ${formatPercent(varPct)} (${formatCurrencyBRL(calc.variableExpensesAmount)})`} 
            />
            <div 
              style={{ width: `${profitPct}%` }} 
              className="bg-emerald-500 rounded-xs transition-all" 
              title={`Lucro Líquido: ${formatPercent(profitPct)} (${formatCurrencyBRL(calc.netProfitAmount)})`} 
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 mt-2 gap-x-2 gap-y-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Diretos: <b className="text-slate-800 font-mono">{formatCurrencyBRL(calc.totalDirectCosts)}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> GGF: <b className="text-slate-800 font-mono">{formatCurrencyBRL(calc.totalGgfUnitCost)}</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Tributos: <b className="text-slate-800 font-mono">{formatCurrencyBRL(calc.taxesAmount)}</b> ({formatPercent(calc.totalTaxRate)})
            </span>
          </div>
        </div>

        {/* Detailed Financial Key Metrics Matrix */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50/70 p-2 rounded-lg text-center">
            <div className="text-[10px] text-slate-500 font-medium">Margem Contribuição</div>
            <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
              {formatPercent(calc.contributionMarginRate)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {formatCurrencyBRL(calc.contributionMarginAmount)}
            </div>
          </div>

          <div className="bg-slate-50/70 p-2 rounded-lg text-center">
            <div className="text-[10px] text-slate-500 font-medium">Ponto de Equilíbrio</div>
            <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
              {calc.breakEvenQuantity} <span className="text-[10px] font-normal text-slate-500">un/mês</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {formatCurrencyBRL(calc.breakEvenRevenue)}
            </div>
          </div>

          <div className="bg-slate-50/70 p-2 rounded-lg text-center">
            <div className="text-[10px] text-slate-500 font-medium">Markup Multiplicador</div>
            <div className="text-xs font-bold text-indigo-700 font-mono mt-0.5">
              {calc.markupMultiplier.toFixed(2)}x <span className="text-[9px] font-normal text-slate-500">s/ direto</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {calc.markupOverTotalCost.toFixed(2)}x total
            </div>
          </div>
        </div>

        {/* Monthly Projection Pill */}
        <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vol. Mensal: <b className="font-mono">{product.targetSalesVolume} un</b></span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[11px]">Lucro Projetado: </span>
            <span className="font-bold text-emerald-700 font-mono">{formatCurrencyBRL(monthlyNetProfit)}/mês</span>
          </div>
        </div>

        {/* Quick Simulator Collapse */}
        {showSimulator && (
          <div className="mt-3 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-indigo-950 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Simulação de Preço de Venda
              </span>
              <button
                onClick={handleResetPrice}
                className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
              >
                Resetar p/ Sugerido
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-[11px]">Novo Preço:</span>
                <span className="font-mono font-bold text-indigo-900 text-sm">
                  {formatCurrencyBRL(simulatedPrice)}
                </span>
              </div>
              <input
                type="range"
                min={Math.max(1, Math.round(calc.totalUnitCost * 0.8))}
                max={Math.round(calc.suggestedSalePrice * 2.2)}
                step="0.5"
                value={simulatedPrice}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Custo Total: {formatCurrencyBRL(calc.totalUnitCost)}</span>
                <span>Desconto Máx Seguro: {formatPercent(calc.maximumDiscountRate)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/90 border-t border-slate-200/70 flex items-center justify-between gap-2">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showSimulator ? 'Fechar Simulador' : 'Simular Preço'}</span>
        </button>

        <button
          onClick={() => onEdit(product)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 rounded-lg transition-colors"
        >
          <span>Abrir Ficha Técnica</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
