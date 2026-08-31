import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  HelpCircle, 
  DollarSign, 
  Percent, 
  Layers, 
  Building2, 
  Receipt, 
  Check, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Clock,
  Package,
  Wrench,
  Zap,
  Info
} from 'lucide-react';
import { 
  ProductItem, 
  DirectCostItem, 
  GGFItem, 
  TaxSettings, 
  VariableExpenses, 
  FixedExpenseAllocation,
  TaxRegime,
  PricingMethod
} from '../types';
import { 
  calculateProductPricing, 
  formatCurrencyBRL, 
  formatPercent 
} from '../utils/pricingCalculator';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductItem) => void;
  initialProduct?: ProductItem | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  if (!isOpen) return null;

  // Active Tab in Form
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'direct' | 'ggf' | 'fixed' | 'taxes' | 'profit'>('direct');

  // Form State
  const [code, setCode] = useState(initialProduct?.code || `PRD-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'Manufatura / Produção');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [targetSalesVolume, setTargetSalesVolume] = useState<number>(initialProduct?.targetSalesVolume || 100);
  const [receivableDays, setReceivableDays] = useState<number>(initialProduct?.receivableDays ?? 30);
  const [payableDays, setPayableDays] = useState<number>(initialProduct?.payableDays ?? 15);

  // Direct Costs
  const [directCosts, setDirectCosts] = useState<DirectCostItem[]>(
    initialProduct?.directCosts || [
      { id: '1', name: 'Insumo / Matéria-prima Principal', category: 'raw_material', unit: 'un', quantity: 1, unitCost: 15.00, totalCost: 15.00 },
      { id: '2', name: 'Embalagem Individual', category: 'packaging', unit: 'un', quantity: 1, unitCost: 2.50, totalCost: 2.50 },
      { id: '3', name: 'Mão de Obra Direta de Montagem/Preparo', category: 'direct_labor', unit: 'horas', quantity: 0.5, unitCost: 20.00, totalCost: 10.00 },
    ]
  );

  // GGF (Gastos Gerais de Fabricação)
  const [ggfItems, setGgfItems] = useState<GGFItem[]>(
    initialProduct?.ggfItems || [
      { id: 'ggf-1', name: 'Energia Elétrica das Máquinas / Oficina', category: 'energy', allocationType: 'percentage_direct_cost', value: 3.5, calculatedUnitCost: 0.96 },
      { id: 'ggf-2', name: 'Depreciação & Manutenção de Equipamentos', category: 'depreciation', allocationType: 'fixed_per_unit', value: 2.00, calculatedUnitCost: 2.00 },
      { id: 'ggf-3', name: 'Aluguel do Espaço de Produção Rateado', category: 'rent', allocationType: 'fixed_monthly_rate', value: 800, calculatedUnitCost: 8.00 },
    ]
  );

  // Fixed Overhead Allocation
  const [fixedExpenseAllocation, setFixedExpenseAllocation] = useState<FixedExpenseAllocation>(
    initialProduct?.fixedExpenseAllocation || {
      monthlyFixedExpenses: 3000,
      estimatedMonthlyVolume: 300,
      costPerUnit: 10.00,
    }
  );

  // Taxes
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(
    initialProduct?.taxSettings || {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 18.0,
      pis: 1.65,
      cofins: 7.60,
      ipi: 5.0,
      iss: 0,
      irpjCsll: 0,
      takeRawMaterialTaxCredits: true,
      pisCreditRate: 1.65,
      cofinsCreditRate: 7.60,
      icmsCreditRate: 12.0,
      ipiCreditRate: 5.0,
      totalIrpjCsllRealRate: 34.0,
      customTaxRate: 0,
      totalTaxRate: 32.25,
    }
  );

  // Variable Expenses
  const [variableExpenses, setVariableExpenses] = useState<VariableExpenses>(
    initialProduct?.variableExpenses || {
      salesCommissionRate: 3.0,
      cardGatewayRate: 2.99,
      marketplacePlatformRate: 0,
      shippingUnitCost: 0,
      otherVariableRate: 1.0,
      totalVariableRate: 6.99,
    }
  );

  // Profit Strategy
  const [desiredProfitMargin, setDesiredProfitMargin] = useState<number>(initialProduct?.desiredProfitMargin ?? 22.0);
  const [pricingMethod, setPricingMethod] = useState<PricingMethod>(initialProduct?.pricingMethod || 'markup_divisor');
  const [manualSalePrice, setManualSalePrice] = useState<number | undefined>(initialProduct?.manualSalePrice);

  // Temporary current product object for real-time calculation
  const currentDraftProduct: ProductItem = {
    id: initialProduct?.id || 'temp',
    code,
    name: name || 'Novo Produto em Precificação',
    category,
    description,
    targetSalesVolume: Number(targetSalesVolume) || 1,
    directCosts,
    ggfItems,
    fixedExpenseAllocation,
    taxSettings,
    variableExpenses,
    desiredProfitMargin: Number(desiredProfitMargin) || 0,
    pricingMethod,
    manualSalePrice,
    receivableDays: Number(receivableDays) || 0,
    payableDays: Number(payableDays) || 0,
    createdAt: initialProduct?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const calc = calculateProductPricing(currentDraftProduct);

  // Handlers for Direct Costs
  const handleAddDirectCost = (category: 'raw_material' | 'packaging' | 'direct_labor' | 'consumable') => {
    const newItem: DirectCostItem = {
      id: `dc-${Date.now()}`,
      name: category === 'packaging' ? 'Nova Embalagem' : category === 'direct_labor' ? 'Mão de Obra de Produção' : 'Novo Insumo / Matéria-prima',
      category,
      unit: category === 'direct_labor' ? 'horas' : 'un',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    };
    setDirectCosts([...directCosts, newItem]);
  };

  const handleUpdateDirectCost = (id: string, field: keyof DirectCostItem, value: any) => {
    setDirectCosts(
      directCosts.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitCost') {
            updated.totalCost = Number(((Number(updated.quantity) || 0) * (Number(updated.unitCost) || 0)).toFixed(2));
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveDirectCost = (id: string) => {
    setDirectCosts(directCosts.filter((item) => item.id !== id));
  };

  // Handlers for GGF
  const handleAddGgf = () => {
    const newItem: GGFItem = {
      id: `ggf-${Date.now()}`,
      name: 'Novo Gasto Geral de Fabricação',
      category: 'other',
      allocationType: 'fixed_per_unit',
      value: 0,
      calculatedUnitCost: 0,
    };
    setGgfItems([...ggfItems, newItem]);
  };

  const handleUpdateGgf = (id: string, field: keyof GGFItem, value: any) => {
    setGgfItems(
      ggfItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveGgf = (id: string) => {
    setGgfItems(ggfItems.filter((item) => item.id !== id));
  };

  // Quick preset templates for common Brazilian businesses
  const applyPresetTemplate = (type: 'artesanal' | 'confeitaria' | 'comercio' | 'textil') => {
    if (type === 'artesanal') {
      setCategory('Artesanato & Manufatura');
      setDesiredProfitMargin(25);
      setTaxSettings({ ...taxSettings, regime: 'simples_nacional', simplesRate: 4.5, totalTaxRate: 4.5 });
      setVariableExpenses({ ...variableExpenses, cardGatewayRate: 3.2, salesCommissionRate: 5 });
    } else if (type === 'confeitaria') {
      setCategory('Alimentação & Confeitaria');
      setDesiredProfitMargin(30);
      setTaxSettings({ ...taxSettings, regime: 'simples_nacional', simplesRate: 4.0, totalTaxRate: 4.0 });
      setVariableExpenses({ ...variableExpenses, cardGatewayRate: 2.5, salesCommissionRate: 0, shippingUnitCost: 0 });
    } else if (type === 'comercio') {
      setCategory('Comércio & E-commerce');
      setDesiredProfitMargin(18);
      setTaxSettings({ ...taxSettings, regime: 'simples_nacional', simplesRate: 6.5, totalTaxRate: 6.5 });
      setVariableExpenses({ ...variableExpenses, marketplacePlatformRate: 14.0, cardGatewayRate: 0, shippingUnitCost: 15.0 });
    } else if (type === 'textil') {
      setCategory('Confecção & Têxtil');
      setDesiredProfitMargin(22);
      setTaxSettings({ ...taxSettings, regime: 'simples_nacional', simplesRate: 7.8, totalTaxRate: 7.8 });
      setVariableExpenses({ ...variableExpenses, salesCommissionRate: 4.0, cardGatewayRate: 3.0 });
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, informe o nome do produto.');
      setActiveFormTab('info');
      return;
    }

    const finalProduct: ProductItem = {
      ...currentDraftProduct,
      id: initialProduct?.id || `prod-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    onSave(finalProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialProduct ? 'Editar Formação de Preço' : 'Nova Formação de Preço de Venda'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure Custos Diretos, GGF, Impostos, Comissões e Margem de Lucro Desejada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Screen (Left: Tabs & Inputs, Right: Live Price Controller) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Form Steps & Settings (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-200/80 overflow-y-auto max-h-[calc(92vh-130px)]">
            {/* Form Step Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFormTab('info')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFormTab === 'info' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>1. Dados & Volume</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('direct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFormTab === 'direct' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>2. Custos Diretos</span>
                <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {formatCurrencyBRL(calc.totalDirectCosts)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('ggf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFormTab === 'ggf' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>3. GGF (Indiretos)</span>
                <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                  {formatCurrencyBRL(calc.totalGgfUnitCost)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('fixed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFormTab === 'fixed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>4. Despesas Fixas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('taxes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFormTab === 'taxes' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>5. Impostos & Taxas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('profit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeFormTab === 'profit' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>6. Margem de Lucro</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 space-y-5">
              {/* TAB 1: Informações Gerais */}
              {activeFormTab === 'info' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Identificação & Estimativa de Venda</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Presets rápidos:</span>
                      <button
                        type="button"
                        onClick={() => applyPresetTemplate('confeitaria')}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-medium text-slate-700"
                      >
                        Gastronomia
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetTemplate('artesanal')}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-medium text-slate-700"
                      >
                        Artesanato
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPresetTemplate('comercio')}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-medium text-slate-700"
                      >
                        E-commerce
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Código / SKU</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                        placeholder="Ex: MAN-001"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                        placeholder="Ex: Bolsa de Couro Artesanal Executiva"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Ex: Confecção / Manufatura"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Volume Estimado de Vendas / Mês
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={targetSalesVolume}
                          onChange={(e) => setTargetSalesVolume(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                          unidades/mês
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Utilizado para o rateio do GGF e projeção do fluxo de caixa.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição / Observações</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Detalhes sobre a fabricação, material ou especificações..."
                    />
                  </div>

                  {/* Cash Flow Payment Terms */}
                  <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Prazos Médios para o Fluxo de Caixa Previsto
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Prazo Médio de Recebimento das Vendas
                        </label>
                        <select
                          value={receivableDays}
                          onChange={(e) => setReceivableDays(parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800"
                        >
                          <option value={0}>À vista / PIX no ato (0 dias)</option>
                          <option value={14}>Cartão / Marketplace (14 dias)</option>
                          <option value={30}>Boleto / Prazo 30 dias</option>
                          <option value={60}>Parcelado / Prazo 60 dias</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          Prazo Médio de Pagamento aos Fornecedores
                        </label>
                        <select
                          value={payableDays}
                          onChange={(e) => setPayableDays(parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800"
                        >
                          <option value={0}>À vista na compra (0 dias)</option>
                          <option value={15}>Boleto quinzenal (15 dias)</option>
                          <option value={30}>Faturado 30 dias</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Custos Diretos (Insumos, Embalagem, Mão de Obra) */}
              {activeFormTab === 'direct' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Custos Diretos de Fabricação / Aquisição</h3>
                      <p className="text-xs text-slate-500">
                        Insumos, matéria-prima, embalagens e tempo de mão de obra direta por unidade
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Subtotal Direto: </span>
                      <span className="text-sm font-extrabold text-blue-700 font-mono">
                        {formatCurrencyBRL(calc.totalDirectCosts)}
                      </span>
                    </div>
                  </div>

                  {/* List of Direct Cost Items */}
                  <div className="space-y-2.5">
                    {directCosts.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
                      >
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateDirectCost(item.id, 'name', e.target.value)}
                            placeholder="Nome do Insumo / Etapa"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-900"
                          />
                        </div>

                        <div className="w-28">
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateDirectCost(item.id, 'category', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700"
                          >
                            <option value="raw_material">Matéria-prima</option>
                            <option value="packaging">Embalagem</option>
                            <option value="direct_labor">Mão de Obra</option>
                            <option value="consumable">Insumo / Outro</option>
                          </select>
                        </div>

                        <div className="w-16">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateDirectCost(item.id, 'unit', e.target.value)}
                            placeholder="un, kg, h"
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono text-[11px]"
                          />
                        </div>

                        <div className="w-20">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleUpdateDirectCost(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qtd"
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-right"
                          />
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateDirectCost(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                            placeholder="R$ Unit"
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-right font-semibold"
                          />
                        </div>

                        <div className="w-24 text-right font-mono font-bold text-slate-900 py-1.5 sm:py-0">
                          {formatCurrencyBRL(item.totalCost)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDirectCost(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end sm:self-auto"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Cost Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAddDirectCost('raw_material')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Matéria-prima / Insumo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddDirectCost('packaging')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Embalagem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddDirectCost('direct_labor')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>+ Mão de Obra Direta</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: GGF (Gastos Gerais de Fabricação / Custos Indiretos) */}
              {activeFormTab === 'ggf' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-purple-600" />
                        GGF - Gastos Gerais de Fabricação (Custos Indiretos)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Energia da fábrica, aluguel de espaço, depreciação de maquinário e manutenção
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Total GGF Unitário: </span>
                      <span className="text-sm font-extrabold text-purple-700 font-mono">
                        {formatCurrencyBRL(calc.totalGgfUnitCost)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-950 flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <b>O que é GGF?</b> São os custos indispensáveis para a fabricação que não podem ser medidos diretamente em uma única unidade de forma óbvia (ex: energia que move os tornos/fornos, lubrificação, aluguel do galpão de produção, desgaste das máquinas).
                    </span>
                  </div>

                  {/* GGF Items List */}
                  <div className="space-y-2.5">
                    {ggfItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
                      >
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateGgf(item.id, 'name', e.target.value)}
                            placeholder="Ex: Energia Elétrica Industrial"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-900"
                          />
                        </div>

                        <div className="w-44">
                          <select
                            value={item.allocationType}
                            onChange={(e) => handleUpdateGgf(item.id, 'allocationType', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700"
                          >
                            <option value="fixed_per_unit">R$ Fixo por unidade</option>
                            <option value="percentage_direct_cost">% do Custo Direto</option>
                            <option value="fixed_monthly_rate">R$ Total Mês / Volume</option>
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.value}
                            onChange={(e) => handleUpdateGgf(item.id, 'value', parseFloat(e.target.value) || 0)}
                            placeholder={item.allocationType === 'percentage_direct_cost' ? '%' : 'R$'}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-right font-semibold"
                          />
                        </div>

                        <div className="w-28 text-right font-mono text-purple-700 font-bold">
                          {item.allocationType === 'percentage_direct_cost' && (
                            <span>{formatCurrencyBRL(calc.totalDirectCosts * (item.value / 100))}</span>
                          )}
                          {item.allocationType === 'fixed_monthly_rate' && (
                            <span>{formatCurrencyBRL(item.value / Math.max(1, targetSalesVolume))}</span>
                          )}
                          {item.allocationType === 'fixed_per_unit' && (
                            <span>{formatCurrencyBRL(item.value)}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveGgf(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remover GGF"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGgf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Adicionar Item de GGF</span>
                  </button>
                </div>
              )}

              {/* TAB 4: Despesas Fixas Rateadas */}
              {activeFormTab === 'fixed' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Despesas Operacionais e Administrativas Fixas</h3>
                      <p className="text-xs text-slate-500">
                        Rateio dos custos fixos da empresa (administrativo, softwares, contabilidade, aluguel comercial)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Rateio Unitário: </span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {formatCurrencyBRL(calc.totalFixedExpensesUnit)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Total de Despesas Fixas Mensais da Empresa (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            R$
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={fixedExpenseAllocation.monthlyFixedExpenses}
                            onChange={(e) => setFixedExpenseAllocation({
                              ...fixedExpenseAllocation,
                              monthlyFixedExpenses: parseFloat(e.target.value) || 0,
                            })}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Ex: Pró-labore fixo, contador, internet, limpeza, taxas bancárias.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Volume Global Mensal de Produtos (unidades)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={fixedExpenseAllocation.estimatedMonthlyVolume}
                          onChange={(e) => setFixedExpenseAllocation({
                            ...fixedExpenseAllocation,
                            estimatedMonthlyVolume: Math.max(1, parseInt(e.target.value) || 1),
                          })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Capacidade total de vendas somando todos os produtos do negócio.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                      <span>Custo Fixo Rateado por este Produto:</span>
                      <span className="font-mono font-extrabold text-emerald-700 text-sm">
                        {formatCurrencyBRL(
                          fixedExpenseAllocation.monthlyFixedExpenses / Math.max(1, fixedExpenseAllocation.estimatedMonthlyVolume)
                        )} / unidade
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Impostos e Despesas Variáveis */}
              {activeFormTab === 'taxes' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Tributação & Regime Tributário</h3>
                    <p className="text-xs text-slate-500">
                      Alíquota efetiva de impostos que incidem diretamente sobre a nota fiscal / preço de venda
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Regime Tributário</label>
                      <select
                        value={taxSettings.regime}
                        onChange={(e) => {
                          const reg = e.target.value as TaxRegime;
                          if (reg === 'lucro_real') {
                            setTaxSettings({
                              ...taxSettings,
                              regime: 'lucro_real',
                              simplesRate: 0,
                              icms: 18.0,
                              pis: 1.65,
                              cofins: 7.60,
                              ipi: 5.0,
                              takeRawMaterialTaxCredits: true,
                              pisCreditRate: 1.65,
                              cofinsCreditRate: 7.60,
                              icmsCreditRate: 12.0,
                              ipiCreditRate: 5.0,
                              totalIrpjCsllRealRate: 34.0,
                              totalTaxRate: 32.25,
                            });
                          } else if (reg === 'simples_nacional') {
                            setTaxSettings({
                              ...taxSettings,
                              regime: 'simples_nacional',
                              simplesRate: 6.5,
                              totalTaxRate: 6.5,
                              takeRawMaterialTaxCredits: false,
                            });
                          } else {
                            setTaxSettings({ ...taxSettings, regime: reg });
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="lucro_real">⭐ Lucro Real (Regime Não-Cumulativo PIS/COFINS + IRPJ/CSLL 34%)</option>
                        <option value="lucro_presumido">Lucro Presumido (Cumulativo 3.65% PIS/COFINS + ICMS)</option>
                        <option value="simples_nacional">Simples Nacional (DAS Unificado)</option>
                        <option value="mei">MEI (Microempreendedor Individual)</option>
                        <option value="custom">Alíquota Efetiva Personalizada (%)</option>
                      </select>
                    </div>

                    {taxSettings.regime === 'lucro_real' && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Empresa em Regime de Lucro Real</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                          PIS/COFINS Não-Cumulativo (9,25%), ICMS/IPI com aproveitamento de créditos fiscais nos insumos e IRPJ/CSLL (34%) sobre o lucro contábil (LAIR).
                        </p>
                      </div>
                    )}

                    {taxSettings.regime === 'simples_nacional' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Alíquota Efetiva do Simples Nacional (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="35"
                            value={taxSettings.simplesRate}
                            onChange={(e) => setTaxSettings({
                              ...taxSettings,
                              simplesRate: parseFloat(e.target.value) || 0,
                              totalTaxRate: parseFloat(e.target.value) || 0,
                            })}
                            className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-rose-600"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            %
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Ex: 4.0% a 7.8% para faixas iniciais de Comércio ou Indústria.
                        </p>
                      </div>
                    )}

                    {(taxSettings.regime === 'custom' || taxSettings.regime === 'mei') && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Alíquota Efetiva Total (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="50"
                            value={taxSettings.customTaxRate}
                            onChange={(e) => setTaxSettings({
                              ...taxSettings,
                              customTaxRate: parseFloat(e.target.value) || 0,
                              totalTaxRate: parseFloat(e.target.value) || 0,
                            })}
                            className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-rose-600"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            %
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lucro Real Specific Settings */}
                  {taxSettings.regime === 'lucro_real' && (
                    <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Alíquotas de Saída (Faturamento / NF)</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setTaxSettings({
                              ...taxSettings,
                              icms: 18.0,
                              pis: 1.65,
                              cofins: 7.60,
                              ipi: 5.0,
                              takeRawMaterialTaxCredits: true,
                              pisCreditRate: 1.65,
                              cofinsCreditRate: 7.60,
                              icmsCreditRate: 12.0,
                              ipiCreditRate: 5.0,
                              totalIrpjCsllRealRate: 34.0,
                            })}
                            className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Preset Indústria
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaxSettings({
                              ...taxSettings,
                              icms: 18.0,
                              pis: 1.65,
                              cofins: 7.60,
                              ipi: 0,
                              takeRawMaterialTaxCredits: true,
                              pisCreditRate: 1.65,
                              cofinsCreditRate: 7.60,
                              icmsCreditRate: 12.0,
                              ipiCreditRate: 0,
                              totalIrpjCsllRealRate: 34.0,
                            })}
                            className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Preset Comércio
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">ICMS Saída (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={taxSettings.icms}
                            onChange={(e) => setTaxSettings({ ...taxSettings, icms: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">PIS Saída (1,65%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={taxSettings.pis}
                            onChange={(e) => setTaxSettings({ ...taxSettings, pis: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">COFINS Saída (7,60%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={taxSettings.cofins}
                            onChange={(e) => setTaxSettings({ ...taxSettings, cofins: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">IPI Indústria (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={taxSettings.ipi || 0}
                            onChange={(e) => setTaxSettings({ ...taxSettings, ipi: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Lucro Real Non-Cumulative Credits Toggle & Rates */}
                      <div className="pt-2 border-t border-slate-200/80 space-y-2">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={taxSettings.takeRawMaterialTaxCredits ?? true}
                            onChange={(e) => setTaxSettings({ ...taxSettings, takeRawMaterialTaxCredits: e.target.checked })}
                            className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              Aproveitar Créditos de PIS/COFINS (9,25%) e ICMS/IPI nos Insumos e Energia (Não-cumulativo)
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Reduz o custo contábil dos insumos e energia através do abatimento direto dos créditos fiscais de entrada.
                            </p>
                          </div>
                        </label>

                        {taxSettings.takeRawMaterialTaxCredits && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 pl-6">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold">Crédito PIS + COFINS Entradas (%)</label>
                              <div className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-1 border border-slate-200 rounded-md">
                                {((taxSettings.pisCreditRate || 1.65) + (taxSettings.cofinsCreditRate || 7.60)).toFixed(2)}% (1.65% + 7.60%)
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold">Crédito Médio ICMS Insumos (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={taxSettings.icmsCreditRate || 12.0}
                                onChange={(e) => setTaxSettings({ ...taxSettings, icmsCreditRate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md font-mono font-bold text-emerald-700"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold">IRPJ + CSLL s/ Lucro Real (LAIR)</label>
                              <div className="text-xs font-mono font-bold text-rose-700 bg-white px-2 py-1 border border-slate-200 rounded-md">
                                {taxSettings.totalIrpjCsllRealRate || 34.0}% (15% + 10% + 9%)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {taxSettings.regime === 'lucro_presumido' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">ICMS (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={taxSettings.icms}
                          onChange={(e) => setTaxSettings({ ...taxSettings, icms: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">PIS / COFINS (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={(taxSettings.pis || 0) + (taxSettings.cofins || 0)}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value) || 0;
                            setTaxSettings({ ...taxSettings, pis: v * 0.18, cofins: v * 0.82 });
                          }}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">IPI / ISS (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={taxSettings.ipi || taxSettings.iss}
                          onChange={(e) => setTaxSettings({ ...taxSettings, ipi: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">IRPJ/CSLL Presum. (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={taxSettings.irpjCsll}
                          onChange={(e) => setTaxSettings({ ...taxSettings, irpjCsll: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Commercial Variables */}
                  <div className="pt-3 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Despesas Comerciais & Venda</h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Comissões de equipe, taxa de cartão/gateway e taxas de marketplace
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Comissão de Venda (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={variableExpenses.salesCommissionRate}
                          onChange={(e) => setVariableExpenses({
                            ...variableExpenses,
                            salesCommissionRate: parseFloat(e.target.value) || 0,
                          })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Taxa Cartão / Gateway (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variableExpenses.cardGatewayRate}
                          onChange={(e) => setVariableExpenses({
                            ...variableExpenses,
                            cardGatewayRate: parseFloat(e.target.value) || 0,
                          })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Taxa Marketplace (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={variableExpenses.marketplacePlatformRate}
                          onChange={(e) => setVariableExpenses({
                            ...variableExpenses,
                            marketplacePlatformRate: parseFloat(e.target.value) || 0,
                          })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                          placeholder="Ex: 14% Mercado Livre"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Frete Unitário Subsidiado (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            R$
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={variableExpenses.shippingUnitCost}
                            onChange={(e) => setVariableExpenses({
                              ...variableExpenses,
                              shippingUnitCost: parseFloat(e.target.value) || 0,
                            })}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Outras Taxas / Embalagem de Envio (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={variableExpenses.otherVariableRate}
                          onChange={(e) => setVariableExpenses({
                            ...variableExpenses,
                            otherVariableRate: parseFloat(e.target.value) || 0,
                          })}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Margem de Lucro Desejada e Estratégia */}
              {activeFormTab === 'profit' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Estratégia de Precificação & Margem Líquida</h3>
                    <p className="text-xs text-slate-500">
                      Defina a margem de lucro líquido que sua empresa deseja embolsar após pagar todos os custos e impostos
                    </p>
                  </div>

                  {/* Pricing Method Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setPricingMethod('markup_divisor')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        pricingMethod === 'markup_divisor'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">Markup Divisor (Margem por Dentro)</span>
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Cálculo contábil exato que garante que a margem desejada será 100% real sobre o faturamento.
                      </p>
                    </div>

                    <div
                      onClick={() => setPricingMethod('target_price')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        pricingMethod === 'target_price'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">Preço Alvo / Concorrência</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Digite o preço final de mercado e a ferramenta calcula a margem líquida real resultante.
                      </p>
                    </div>
                  </div>

                  {/* Margem Desejada Slider & Input */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Margem Líquida Desejada (% sobre o Preço de Venda)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="80"
                          value={desiredProfitMargin}
                          onChange={(e) => setDesiredProfitMargin(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm bg-white border border-slate-200 rounded-lg text-right font-mono font-bold text-emerald-700"
                        />
                        <span className="text-xs font-bold text-slate-600">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="0.5"
                      value={desiredProfitMargin}
                      onChange={(e) => setDesiredProfitMargin(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Conservadora (10% - 15%)</span>
                      <span className="text-emerald-700 font-bold">Ideal Padrão (20% - 30%)</span>
                      <span>Alta Lucratividade (35%+)</span>
                    </div>
                  </div>

                  {/* Preço Manual se Target Price */}
                  {pricingMethod === 'target_price' && (
                    <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                      <label className="block text-xs font-bold text-indigo-950 mb-1">
                        Preço Praticado no Mercado (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                          R$
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={manualSalePrice || ''}
                          onChange={(e) => setManualSalePrice(parseFloat(e.target.value) || undefined)}
                          placeholder={calc.suggestedSalePrice.toString()}
                          className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-indigo-200 rounded-xl font-mono font-extrabold text-indigo-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Real-Time Financial DRE & Price Cockpit (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/70 p-5 flex flex-col justify-between overflow-y-auto max-h-[calc(92vh-130px)] space-y-4">
            <div>
              {/* Header Price Banner */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Preço de Venda Final</span>
                  <span className="text-emerald-700 font-mono font-bold">
                    Margem Líq: {formatPercent(calc.netProfitRate)}
                  </span>
                </div>

                <div className="text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
                  <span>{formatCurrencyBRL(calc.effectiveSalePrice)}</span>
                  <span className="text-xs font-normal text-slate-400 font-sans">/ unidade</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Lucro Líquido por Venda:</span>
                  <span className="font-mono font-extrabold text-emerald-600">
                    +{formatCurrencyBRL(calc.netProfitAmount)}
                  </span>
                </div>
              </div>

              {/* Composição Unitária Passo a Passo */}
              <div className="mt-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Composição do Preço de Venda</span>
                  <span className="text-[10px] text-slate-400 font-normal">Memória de Cálculo</span>
                </h4>

                <div className="text-xs divide-y divide-slate-100 font-mono">
                  <div className="py-1.5 flex justify-between font-bold text-slate-900">
                    <span>(+) Faturamento Bruto</span>
                    <span>{formatCurrencyBRL(calc.effectiveSalePrice)}</span>
                  </div>

                  <div className="py-1.5 flex justify-between text-rose-600">
                    <span>(-) Impostos s/ Vendas ({formatPercent(calc.totalTaxRate)})</span>
                    <span>-{formatCurrencyBRL(calc.taxesAmount)}</span>
                  </div>

                  <div className="py-1.5 flex justify-between font-semibold text-slate-800 bg-slate-50/60 px-1 rounded">
                    <span>(=) Receita Operacional Líquida</span>
                    <span>{formatCurrencyBRL(calc.netRevenue)}</span>
                  </div>

                  <div className="py-1.5 flex justify-between text-blue-700">
                    <span>(-) Custos Diretos (Insumos/MO)</span>
                    <span>-{formatCurrencyBRL(calc.totalDirectCosts)}</span>
                  </div>

                  {calc.rawMaterialTaxCreditsAmount > 0 && (
                    <div className="py-1 flex justify-between text-emerald-700 bg-emerald-50/50 px-1 rounded text-[11px]">
                      <span>(+) Créditos Fiscais Entrada (PIS/COFINS/ICMS)</span>
                      <span>+{formatCurrencyBRL(calc.rawMaterialTaxCreditsAmount)}</span>
                    </div>
                  )}

                  <div className="py-1.5 flex justify-between text-purple-700">
                    <span>(-) GGF (Gastos Gerais Indiretos)</span>
                    <span>-{formatCurrencyBRL(calc.totalGgfUnitCost)}</span>
                  </div>

                  <div className="py-1.5 flex justify-between text-amber-700">
                    <span>(-) Despesas Variáveis (Comissões/Taxas)</span>
                    <span>-{formatCurrencyBRL(calc.variableExpensesAmount)}</span>
                  </div>

                  <div className="py-1.5 flex justify-between font-bold text-indigo-900 bg-indigo-50/50 px-1 rounded">
                    <span>(=) Margem de Contribuição ({formatPercent(calc.contributionMarginRate)})</span>
                    <span>{formatCurrencyBRL(calc.contributionMarginAmount)}</span>
                  </div>

                  <div className="py-1.5 flex justify-between text-slate-600">
                    <span>(-) Despesas Fixas Rateadas</span>
                    <span>-{formatCurrencyBRL(calc.totalFixedExpensesUnit)}</span>
                  </div>

                  {taxSettings.regime === 'lucro_real' ? (
                    <>
                      <div className="py-1.5 flex justify-between font-bold text-slate-800 bg-amber-50/60 px-1 rounded">
                        <span>(=) LAIR (Lucro Antes do IRPJ/CSLL)</span>
                        <span>{formatCurrencyBRL(calc.lairAmount)}</span>
                      </div>

                      <div className="py-1.5 flex justify-between text-rose-700">
                        <span>(-) Provisão IRPJ & CSLL (34% Lucro Real)</span>
                        <span>-{formatCurrencyBRL(calc.irpjCsllRealAmount)}</span>
                      </div>

                      <div className="py-2 flex justify-between font-black text-sm text-emerald-700 bg-emerald-50 px-2 rounded-lg mt-1">
                        <span>(=) Lucro Líquido Real Unitário</span>
                        <span>{formatCurrencyBRL(calc.netProfitAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="py-2 flex justify-between font-black text-sm text-emerald-700 bg-emerald-50 px-2 rounded-lg mt-1">
                      <span>(=) Lucro Líquido Unitário</span>
                      <span>{formatCurrencyBRL(calc.netProfitAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Vital Indicators */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Ponto de Equilíbrio</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {calc.breakEvenQuantity} <span className="text-[10px] font-normal text-slate-500">un/mês</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatCurrencyBRL(calc.breakEvenRevenue)}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium">Desconto Máximo Seguro</div>
                  <div className="text-sm font-bold text-amber-600 font-mono mt-0.5">
                    {formatPercent(calc.maximumDiscountRate)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    antes de entrar no prejuízo
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Save Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Precificação</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
