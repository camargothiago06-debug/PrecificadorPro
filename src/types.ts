export type TaxRegime = 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei' | 'custom';

export type DirectCostCategory = 'raw_material' | 'packaging' | 'direct_labor' | 'consumable' | 'other';

export interface DirectCostItem {
  id: string;
  name: string;
  category: DirectCostCategory;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export type GGFAllocationType = 'percentage_direct_cost' | 'fixed_monthly_rate' | 'fixed_per_unit';

export interface GGFItem {
  id: string;
  name: string;
  category: 'energy' | 'rent' | 'depreciation' | 'maintenance' | 'supervision' | 'other';
  allocationType: GGFAllocationType;
  value: number; // % or R$ per month or R$ per unit
  calculatedUnitCost: number;
}

export interface TaxSettings {
  regime: TaxRegime;
  simplesRate: number; // % effective rate
  icms: number; // %
  pis: number; // %
  cofins: number; // %
  ipi: number; // %
  iss: number; // %
  irpjCsll: number; // %
  customTaxRate: number; // %
  totalTaxRate: number; // % total effective on gross revenue
}

export interface VariableExpenses {
  salesCommissionRate: number; // %
  cardGatewayRate: number; // % (ex: 2.99% ou taxa de maquininha)
  marketplacePlatformRate: number; // % (ex: 12% ou 16% Mercado Livre/Shopee)
  shippingUnitCost: number; // R$ unit
  otherVariableRate: number; // %
  totalVariableRate: number; // sum of percentage variable costs
}

export interface FixedExpenseAllocation {
  monthlyFixedExpenses: number; // R$ total monthly administrative & commercial fixed costs
  estimatedMonthlyVolume: number; // Total units produced/sold in the business
  costPerUnit: number; // monthlyFixedExpenses / estimatedMonthlyVolume
}

export type PricingMethod = 'markup_divisor' | 'markup_multiplier' | 'target_price';

export interface CalculationResult {
  // Direct Costs
  totalDirectCosts: number;
  rawMaterialCost: number;
  packagingCost: number;
  directLaborCost: number;
  otherDirectCost: number;

  // GGF (Gastos Gerais de Fabricação / Custos Indiretos)
  totalGgfUnitCost: number;

  // Total Production Cost (Custo Total de Produção)
  totalProductionCostUnit: number;

  // Allocated Fixed Expenses (Despesas Operacionais Fixas Rateadas)
  totalFixedExpensesUnit: number;

  // Total Unit Cost (Custo Integral Unitário)
  totalUnitCost: number;

  // Deduction Rates on Gross Price
  totalDeductionsRate: number; // Taxes% + Variable Costs% + Desired Profit Margin%
  totalTaxRate: number;
  totalVariableRate: number;
  desiredProfitRate: number;

  // Suggested / Final Selling Price
  markupDivisorFactor: number; // (1 - DeductionsRate)
  suggestedSalePrice: number;
  effectiveSalePrice: number;

  // Financial Breakdown of Final Selling Price (DRE Unitária)
  grossRevenue: number;
  taxesAmount: number;
  netRevenue: number;
  variableExpensesAmount: number;
  contributionMarginAmount: number; // Net Revenue - Direct Costs - GGF
  contributionMarginRate: number; // Contribution Margin / Gross Revenue (%)
  fixedExpensesAmount: number;
  netProfitAmount: number; // Lucro Líquido Unitário (R$)
  netProfitRate: number; // Margem Líquida Efetiva (%)

  // Key Indicators
  markupMultiplier: number; // Preço / Custo Direto
  markupOverTotalCost: number; // Preço / Custo Integral
  breakEvenQuantity: number; // Ponto de Equilíbrio em Unidades
  breakEvenRevenue: number; // Ponto de Equilíbrio em Faturamento (R$)
  maximumDiscountRate: number; // % máximo de desconto antes do prejuízo (até margem de contribuição zerar ou lucro zerar)
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  targetSalesVolume: number; // Estimativa de vendas por mês (unidades)
  
  // Cost composition
  directCosts: DirectCostItem[];
  ggfItems: GGFItem[];
  fixedExpenseAllocation: FixedExpenseAllocation;
  
  // Taxes and Commercial Variables
  taxSettings: TaxSettings;
  variableExpenses: VariableExpenses;
  
  // Profit Strategy
  desiredProfitMargin: number; // % Margem Líquida Desejada
  pricingMethod: PricingMethod;
  manualSalePrice?: number; // Preço de venda manual para simulação
  
  // Cash Flow parameters
  receivableDays: number; // Dias médios para receber o valor das vendas (ex: 30 dias)
  payableDays: number; // Dias médios para pagar fornecedores de insumo (ex: 15 dias)
  
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowMonthForecast {
  monthIndex: number;
  monthName: string;
  projectedUnits: number;
  grossSalesInvoiced: number;
  cashInflowReceived: number; // Receitas efetivamente recebidas na conta
  
  // Outflows
  rawMaterialPayment: number;
  ggfPayment: number;
  fixedExpensesPayment: number;
  taxesPayment: number;
  variablesAndCommissionsPayment: number;
  totalCashOutflow: number;
  
  // Balance
  netOperatingCash: number; // Inflow - Outflow
  cumulativeCashBalance: number;
}

export interface AppSettings {
  companyName: string;
  defaultTaxRegime: TaxRegime;
  defaultSimplesRate: number;
  defaultCardRate: number;
  defaultCommissionRate: number;
  defaultMonthlyFixedOverhead: number;
  defaultMonthlyGlobalVolume: number;
  currency: string;
}
