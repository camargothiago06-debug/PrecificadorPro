import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Percent, 
  DollarSign, 
  Scale, 
  HelpCircle, 
  Check, 
  Calculator, 
  Tag, 
  Building, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { RegisteredProductItem } from '../types';
import { formatCurrencyBRL, formatPercent } from '../utils/pricingCalculator';

interface RegisteredProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: RegisteredProductItem) => void;
  initialProduct?: RegisteredProductItem | null;
}

export const RegisteredProductModal: React.FC<RegisteredProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Matéria-Prima / Insumos');
  const [unit, setUnit] = useState('kg');
  const [defaultWeightKg, setDefaultWeightKg] = useState<number>(1.0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18.0);
  
  // Tax breakdown assistant
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [icmsRate, setIcmsRate] = useState<number>(18.0);
  const [pisRate, setPisRate] = useState<number>(1.65);
  const [cofinsRate, setCofinsRate] = useState<number>(7.60);
  const [ipiRate, setIpiRate] = useState<number>(0);

  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialProduct) {
      setCode(initialProduct.code || '');
      setName(initialProduct.name || '');
      setCategory(initialProduct.category || 'Matéria-Prima / Insumos');
      setUnit(initialProduct.unit || 'kg');
      setDefaultWeightKg(initialProduct.defaultWeightKg ?? 1.0);
      setTotalPrice(initialProduct.totalPrice || 0);
      setTaxRate(initialProduct.taxRate || 0);
      setIcmsRate(initialProduct.icmsRate || 0);
      setPisRate(initialProduct.pisRate || 0);
      setCofinsRate(initialProduct.cofinsRate || 0);
      setIpiRate(initialProduct.ipiRate || 0);
      setSupplier(initialProduct.supplier || '');
      setDescription(initialProduct.description || '');
      setShowTaxBreakdown(!!(initialProduct.icmsRate || initialProduct.pisRate || initialProduct.cofinsRate || initialProduct.ipiRate));
    } else {
      setCode(`CAD-${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setCategory('Matéria-Prima / Insumos');
      setUnit('kg');
      setDefaultWeightKg(1.0);
      setTotalPrice(10.00);
      setTaxRate(18.0);
      setIcmsRate(18.0);
      setPisRate(1.65);
      setCofinsRate(7.60);
      setIpiRate(0);
      setSupplier('');
      setDescription('');
      setShowTaxBreakdown(false);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  // Real-time calculations:
  // Tax Amount (R$) = Total Price * (Tax Rate / 100)
  // Net Price (R$) = Total Price - Tax Amount
  const taxAmount = (totalPrice * Math.max(0, taxRate)) / 100;
  const netPrice = Math.max(0, totalPrice - taxAmount);

  const handleApplyTaxPreset = (presetName: 'icms18' | 'icms12' | 'lucroReal' | 'simples6' | 'isento') => {
    if (presetName === 'icms18') {
      setTaxRate(18.0);
      setIcmsRate(18.0);
      setPisRate(0);
      setCofinsRate(0);
      setIpiRate(0);
    } else if (presetName === 'icms12') {
      setTaxRate(12.0);
      setIcmsRate(12.0);
      setPisRate(0);
      setCofinsRate(0);
      setIpiRate(0);
    } else if (presetName === 'lucroReal') {
      const sum = 18.0 + 1.65 + 7.60;
      setTaxRate(sum);
      setIcmsRate(18.0);
      setPisRate(1.65);
      setCofinsRate(7.60);
      setIpiRate(0);
    } else if (presetName === 'simples6') {
      setTaxRate(6.5);
      setIcmsRate(0);
      setPisRate(0);
      setCofinsRate(0);
      setIpiRate(0);
    } else if (presetName === 'isento') {
      setTaxRate(0);
      setIcmsRate(0);
      setPisRate(0);
      setCofinsRate(0);
      setIpiRate(0);
    }
  };

  const handleUpdateBreakdown = (icms: number, pis: number, cofins: number, ipi: number) => {
    setIcmsRate(icms);
    setPisRate(pis);
    setCofinsRate(cofins);
    setIpiRate(ipi);
    const total = icms + pis + cofins + ipi;
    setTaxRate(parseFloat(total.toFixed(2)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }

    const productToSave: RegisteredProductItem = {
      id: initialProduct?.id || `reg-prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: code.trim() || `CAD-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category: category.trim() || 'Geral',
      unit: unit.trim() || 'kg',
      defaultWeightKg: Math.max(0.001, defaultWeightKg || 1.0),
      totalPrice: Math.max(0, totalPrice),
      taxRate: Math.max(0, taxRate),
      icmsRate: showTaxBreakdown ? icmsRate : undefined,
      pisRate: showTaxBreakdown ? pisRate : undefined,
      cofinsRate: showTaxBreakdown ? cofinsRate : undefined,
      ipiRate: showTaxBreakdown ? ipiRate : undefined,
      taxAmount: parseFloat(taxAmount.toFixed(4)),
      netPrice: parseFloat(netPrice.toFixed(4)),
      supplier: supplier.trim() || undefined,
      description: description.trim() || undefined,
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(productToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialProduct ? 'Editar Produto Cadastrado' : 'Novo Produto com Impostos'}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Cadastre o valor total e o imposto para cálculo automático do preço líquido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Identification Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Código / SKU / NCM
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: PP-001"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Produto / Insumo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Resina Polipropileno Virgem Homopolímero"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Polímeros, Químicos, Alimentos"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="kg">Kilograma (kg)</option>
                <option value="un">Unidade (un)</option>
                <option value="l">Litro (l)</option>
                <option value="pct">Pacote (pct)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="m">Metro (m)</option>
                <option value="m2">Metro Quadrado (m²)</option>
                <option value="par">Par (par)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peso Unitário em kg
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={defaultWeightKg}
                  onChange={(e) => setDefaultWeightKg(Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                  className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                  kg/{unit}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Tax Multiplier Core Section */}
          <div className="p-4.5 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-emerald-50/70 rounded-2xl border border-indigo-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Valor Total & Multiplicação do Imposto
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    O sistema multiplica o valor total pela alíquota específica para deduzir o preço líquido
                  </p>
                </div>
              </div>

              {/* Tax presets */}
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyTaxPreset('icms18')}
                  className="text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                >
                  ICMS 18%
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTaxPreset('icms12')}
                  className="text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                >
                  ICMS 12%
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTaxPreset('lucroReal')}
                  className="text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                >
                  Lucro Real (27.25%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTaxPreset('isento')}
                  className="text-[10px] bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                >
                  Isento (0%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Valor Total Bruto */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  1. Valor Total Bruto do Produto (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono font-black text-slate-950"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                    /{unit}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Valor cheio da nota fiscal ou custo total do insumo
                </p>
              </div>

              {/* Imposto Aplicável */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    2. Alíquota de Imposto (%) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {showTaxBreakdown ? 'Ocultar detalhamento' : 'Detalhar impostos'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono font-black text-rose-600"
                    placeholder="18.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Imposto incidente específico para este produto
                </p>
              </div>
            </div>

            {/* Optional detailed tax breakdown */}
            {showTaxBreakdown && (
              <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 space-y-2 animate-in fade-in duration-200">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Composição da Alíquota de Imposto (Soma automática):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">ICMS (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={icmsRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleUpdateBreakdown(val, pisRate, cofinsRate, ipiRate);
                      }}
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">PIS (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pisRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleUpdateBreakdown(icmsRate, val, cofinsRate, ipiRate);
                      }}
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">COFINS (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cofinsRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleUpdateBreakdown(icmsRate, pisRate, val, ipiRate);
                      }}
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">IPI (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ipiRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleUpdateBreakdown(icmsRate, pisRate, cofinsRate, val);
                      }}
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LIVE CALCULATION RESULT CARD */}
            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 justify-center sm:justify-start">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Fórmula Aplicada em Tempo Real:
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  {formatCurrencyBRL(totalPrice)} × {formatPercent(taxRate)} = <span className="font-bold text-rose-600">{formatCurrencyBRL(taxAmount)} de Imposto</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatCurrencyBRL(totalPrice)} - {formatCurrencyBRL(taxAmount)} = <span className="font-bold text-emerald-700">Preço Líquido</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-right">
                  <span className="text-[10px] font-bold uppercase text-rose-600 block">Imposto Deduzido</span>
                  <span className="text-xs font-mono font-black text-rose-700">
                    -{formatCurrencyBRL(taxAmount)}
                  </span>
                </div>

                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-300 text-right">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">Preço Líquido Final</span>
                  <span className="text-lg font-mono font-black text-emerald-700 block leading-tight">
                    {formatCurrencyBRL(netPrice)}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold block">
                    por {unit} ({defaultWeightKg} kg)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fornecedor / Fabricante
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Braskem, Cabot, Distribuidor Local"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações Fiscais / Detalhes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: NCM 3902.10.20, tributação monofásica ou com crédito"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
