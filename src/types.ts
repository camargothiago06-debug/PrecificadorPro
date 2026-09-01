export type TaxRegime = 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei' | 'custom';

export type DirectCostCategory = 'raw_material' | 'packaging' | 'direct_labor' | 'consumable' | 'other';

export interface DirectCostItem {
  id: string;
  name: string;
  category: DirectCostCategory;
  unit: string; // Padrão: 'kg' (quilograma)
  quantity: number; // Quantidade em kg por kg de produto acabado
  unitCost: number; // Custo do insumo em R$/kg
  totalCost: number; // Custo total do insumo em R$/kg
  hasTaxCredit?: boolean; // Se gera crédito de PIS/COFINS/ICMS no Lucro Real
}

export type GGFAllocationType = 
  | 'rate_per_kg' // Rateio por kg da fábrica (R$ total mensal ÷ Capacidade total em kg/mês)
  | 'fixed_per_kg' // Custo GGF fixo em R$ por kg
  | 'percentage_direct_cost' // % sobre o custo direto por kg
  | 'fixed_monthly_rate' // R$ total mensal ÷ Volume em kg/mês
  | 'fixed_per_unit'; // R$ fixo por kg

export interface GGFItem {
  id: string;
  name: string;
  category: 'energy' | 'rent' | 'depreciation' | 'maintenance' | 'supervision' | 'other';
  allocationType: GGFAllocationType;
  value: number; // R$/kg, % ou R$/mês
  calculatedUnitCost: number; // R$/kg
  calculatedCostPerKg?: number; // Custo equivalente em R$/kg
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
  shippingUnitCost: number; // Frete em R$/kg
  otherVariableRate: number; // %
  totalVariableRate: number; // soma das taxas variáveis percentuais
}

export interface FixedExpenseAllocation {
  monthlyFixedExpenses: number; // R$ total mensal de despesas administrativas e comerciais
  estimatedMonthlyKgVolume?: number; // Capacidade / Produção Total da Empresa em Kilogramas (kg/mês)
  estimatedMonthlyVolume: number; // Volume total de produção/vendas em kg/mês
  costPerKg?: number; // monthlyFixedExpenses / estimatedMonthlyKgVolume (R$/kg)
  costPerUnit: number; // Rateio em R$/kg
  allocationBasis?: 'kg' | 'units'; // Base de rateio (Padrão: 'kg')
}

export type PricingMethod = 'markup_divisor' | 'markup_multiplier' | 'target_price';

export interface CalculationResult {
  // Product unit weight & measures (100% Kilograma)
  netWeightKg: number; // Peso unitário em kg (padrão: 1.0 kg)
  unitOfMeasure: string; // 'kg' (Kilograma)
  totalMonthlyKg: number; // Volume total em kg/mês

  // Direct Costs (R$/kg)
  totalDirectCosts: number; // Custo Direto Total em R$/kg
  directCostPerKg: number; // R$/kg
  directCostsPerKg: number; // R$/kg (alias)
  rawMaterialCost: number; // Custo Matéria-Prima em R$/kg
  rawMaterialCostPerKg: number; // R$/kg
  packagingCost: number; // Custo Embalagem em R$/kg
  packagingCostPerKg: number; // R$/kg
  directLaborCost: number; // Custo MOD em R$/kg
  directLaborCostPerKg: number; // R$/kg
  otherDirectCost: number; // Outros custos diretos em R$/kg
  otherDirectCostPerKg: number; // R$/kg

  // GGF (Gastos Gerais de Fabricação em R$/kg)
  totalGgfUnitCost: number; // GGF Total em R$/kg
  ggfPerKg: number; // GGF em R$/kg

  // Total Production Cost (Custo Total de Produção em R$/kg)
  totalProductionCostUnit: number; // Custo de Produção em R$/kg
  productionCostPerKg: number; // Custo de Produção em R$/kg

  // Allocated Fixed Expenses (Despesas Operacionais Fixas Rateadas em R$/kg)
  totalFixedExpensesUnit: number; // Despesa Fixa em R$/kg
  fixedExpensesPerKg: number; // Despesas Fixas em R$/kg
  fixedExpensePerKg: number; // Despesas Fixas em R$/kg (alias)

  // Total Cost (Custo Integral Total em R$/kg)
  totalUnitCost: number; // Custo Integral em R$/kg
  totalCostPerKg: number; // Custo Integral em R$/kg
  shippingPerKg: number; // Frete em R$/kg

  // Lucro Real Non-Cumulative Tax Credits on Raw Materials & Energy
  isLucroReal: boolean;
  totalTaxCreditsUnit: number; // Créditos fiscais recuperáveis em R$/kg
  rawMaterialTaxCreditsAmount: number; // R$/kg
  taxCreditsPerKg: number; // R$/kg
  pisTaxCreditUnit: number; // R$/kg
  cofinsTaxCreditUnit: number; // R$/kg
  icmsTaxCreditUnit: number; // R$/kg
  netDirectCostsAfterCredits: number; // Custo Direto Líquido após créditos em R$/kg

  // Deduction Rates on Gross Price
  totalDeductionsRate: number; // Taxes% + Variable Costs% + Desired Profit Margin%
  totalTaxRate: number;
  totalVariableRate: number;
  desiredProfitRate: number;

  // Selling Prices (R$/kg)
  markupDivisorFactor: number; // (1 - DeductionsRate)
  suggestedSalePrice: number; // Preço de Venda Sugerido em R$/kg
  suggestedSalePricePerKg: number; // R$/kg
  effectiveSalePrice: number; // Preço de Venda Praticado em R$/kg
  effectiveSalePricePerKg: number; // R$/kg

  // Financial Breakdown of Final Selling Price (DRE por Kilograma - R$/kg)
  grossRevenue: number; // Receita Bruta em R$/kg
  grossRevenuePerKg: number; // R$/kg
  taxesAmount: number; // Impostos sobre Vendas em R$/kg
  taxesPerKg: number; // R$/kg
  icmsAmount: number; // ICMS em R$/kg
  pisAmount: number; // PIS em R$/kg
  cofinsAmount: number; // COFINS em R$/kg
  ipiAmount: number; // IPI em R$/kg
  issAmount: number; // ISS em R$/kg
  netRevenue: number; // Receita Líquida em R$/kg
  netRevenuePerKg: number; // R$/kg
  variableExpensesAmount: number; // Despesas Variáveis em R$/kg
  variableExpensesPerKg: number; // R$/kg
  contributionMarginAmount: number; // Margem de Contribuição em R$/kg
  contributionMarginPerKg: number; // R$/kg
  contributionMarginRate: number; // Margem de Contribuição (%)
  fixedExpensesAmount: number; // Despesas Fixas em R$/kg

  // Lucro Real Specifics (LAIR & IRPJ/CSLL 34% sobre o Lucro Real)
  lairAmount: number; // Lucro Antes do IRPJ e CSLL em R$/kg
  lairPerKg: number; // R$/kg
  lairRate: number; // % LAIR sobre a receita
  irpjCsllProfitTaxAmount: number; // Provisão IRPJ/CSLL 34% em R$/kg
  irpjCsllRealAmount: number; // R$/kg
  irpjCsllPerKg: number; // R$/kg
  netProfitAmount: number; // Lucro Líquido Final em R$/kg
  netProfitPerKg: number; // Lucro Líquido em R$/kg
  netProfitRate: number; // Margem Líquida Efetiva Final (%)

  // Key Indicators
  markupMultiplier: number; // Preço / Custo Direto
  markupOverTotalCost: number; // Preço / Custo Integral
  breakEvenQuantity: number; // Ponto de Equilíbrio em Kilogramas (kg/mês)
  breakEvenKg: number; // Ponto de Equilíbrio em Kilogramas (kg/mês)
  breakEvenRevenue: number; // Ponto de Equilíbrio em Faturamento Mensal (R$/mês)
  maximumDiscountRate: number; // % máximo de desconto antes do prejuízo
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  
  // Peso e Unidade (100% Kilograma)
  netWeightKg: number; // Peso base do lote/unidade em kg (padrão: 1.0 kg)
  unitOfMeasure?: string; // 'kg'
  
  targetSalesVolume: number; // Estimativa de produção e vendas mensal em Kilogramas (kg/mês)
  factoryMonthlyKgCapacity?: number; // Capacidade total mensal da fábrica em Kilogramas (kg/mês)
  
  // Cost composition (tudo em R$/kg)
  directCosts: DirectCostItem[];
  ggfItems: GGFItem[];
  fixedExpenseAllocation: FixedExpenseAllocation;
  
  // Taxes and Commercial Variables
  taxSettings: TaxSettings;
  variableExpenses: VariableExpenses;
  
  // Profit Strategy
  desiredProfitMargin: number; // % Margem Líquida Desejada
  pricingMethod: PricingMethod;
  manualSalePrice?: number; // Preço de venda praticado em R$/kg
  
  // Cash Flow parameters
  receivableDays: number; // Dias médios para receber o valor das vendas (ex: 45 dias para 30/60)
  receivableTermsType?: string; // ex: '30_60', '30_60_90', '30_60_90_120', 'custom', 'a_vista'
  receivableTermsCustom?: string; // string digitada pelo usuário, ex: '30/60/90'
  receivableInstallments?: number[]; // array de dias das parcelas, ex: [30, 60, 90]
  
  payableDays: number; // Dias médios para pagar fornecedores de insumo (ex: 30 dias)
  payableTermsType?: string;
  payableTermsCustom?: string;
  payableInstallments?: number[]; // array de dias das parcelas de pagamento, ex: [30, 60]
  
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowMonthForecast {
  monthIndex: number;
  monthName: string;
  projectedUnits: number; // Volume Projetado em Kilogramas (kg/mês)
  projectedKg?: number; // Volume Projetado em kg/mês
  grossSalesInvoiced: number; // Faturamento Bruto (R$)
  cashInflowReceived: number; // Receitas efetivamente recebidas na conta (R$)
  
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
  defaultMonthlyGlobalVolume: number; // Volume Global em kg/mês
  currency: string;
}
