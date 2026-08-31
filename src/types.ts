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
  hasTaxCredit?: boolean; // Se gera crédito de PIS/COFINS/ICMS no Lucro Real
}

export type GGFAllocationType = 'percentage_direct_cost' | 'fixed_monthly_rate' | 'fixed_per_unit';

export interface GGFItem {
  id: string;
  name: string;
  category: 'energy' | 'rent' | 'depreciation' | 'maintenance' | 'supervision' | 'other';
  allocationType: GGFAllocationType;
  value: number; // % or R$ per month or R$ per unit
  calculatedUnitCost: number;
  hasTaxCredit?: boolean; // Ex: energia elétrica gera crédito de PIS/COFINS no Lucro Real
}

export interface TaxSettings {
  regime: TaxRegime;
  simplesRate: number; // % effective rate
  icms: number; // % sobre vendas (ex: 18% ou 12%)
  pis: number; // % sobre vendas (Lucro Real: 1.65%, Lucro Presumido: 0.65%)
  cofins: number; // % sobre vendas (Lucro Real: 7.60%, Lucro Presumido: 3.00%)
  ipi: number; // % sobre vendas para indústria (ex: 5% a 15%)
  iss: number; // % sobre serviços (ex: 2% a 5%)
  irpjCsll: number; // % para Lucro Presumido (presunção) ou provisão estimada
  
  // Específicos para Lucro Real (Regime Não-Cumulativo):
  takeRawMaterialTaxCredits?: boolean; // Se desconta créditos de PIS/COFINS e ICMS na entrada de insumos
  pisCreditRate?: number; // % crédito PIS nos insumos (padrão 1.65%)
  cofinsCreditRate?: number; // % crédito COFINS nos insumos (padrão 7.60%)
  icmsCreditRate?: number; // % crédito ICMS nos insumos (ex: 12% ou 18%)
  ipiCreditRate?: number; // % crédito IPI nos insumos (ex: 5% ou 0%)
  irpjRealRate?: number; // 15% + 10% adicional = até 25% sobre o LAIR
  csllRealRate?: number; // 9% sobre o LAIR
  totalIrpjCsllRealRate?: number; // Padrão 34% sobre o Lucro Antes do IR/CSLL (LAIR)

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

  // Lucro Real Non-Cumulative Tax Credits on Raw Materials & Energy
  isLucroReal: boolean;
  totalTaxCreditsUnit: number; // Créditos fiscais recuperáveis (PIS 1.65% + COFINS 7.6% + ICMS)
  rawMaterialTaxCreditsAmount: number; // Alias para totalTaxCreditsUnit
  pisTaxCreditUnit: number;
  cofinsTaxCreditUnit: number;
  icmsTaxCreditUnit: number;
  netDirectCostsAfterCredits: number; // Custo Direto Líquido após créditos

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
  icmsAmount: number;
  pisAmount: number;
  cofinsAmount: number;
  ipiAmount: number;
  issAmount: number;
  netRevenue: number;
  variableExpensesAmount: number;
  contributionMarginAmount: number; // Net Revenue - Direct Costs - GGF
  contributionMarginRate: number; // Contribution Margin / Gross Revenue (%)
  fixedExpensesAmount: number;

  // Lucro Real Specifics (LAIR & IRPJ/CSLL 34% sobre o Lucro Real)
  lairAmount: number; // Lucro Antes do IRPJ e CSLL (R$)
  lairRate: number; // % LAIR sobre a receita
  irpjCsllProfitTaxAmount: number; // Provisão de 34% (15%+10% IRPJ + 9% CSLL) sobre o Lucro Real
  irpjCsllRealAmount: number; // Alias para irpjCsllProfitTaxAmount
  netProfitAmount: number; // Lucro Líquido Unitário Final (R$)
  netProfitRate: number; // Margem Líquida Efetiva Final (%)

  // Key Indicators
  markupMultiplier: number; // Preço / Custo Direto
  markupOverTotalCost: number; // Preço / Custo Integral
  breakEvenQuantity: number; // Ponto de Equilíbrio em Unidades
  breakEvenRevenue: number; // Ponto de Equilíbrio em Faturamento (R$)
  maximumDiscountRate: number; // % máximo de desconto antes do prejuízo
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
