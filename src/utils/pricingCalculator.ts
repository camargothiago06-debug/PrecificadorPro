import { ProductItem, CalculationResult, DirectCostItem, GGFItem, TaxSettings, VariableExpenses, FixedExpenseAllocation } from '../types';

export function calculateDirectCosts(items: DirectCostItem[]) {
  let rawMaterialCost = 0;
  let packagingCost = 0;
  let directLaborCost = 0;
  let otherDirectCost = 0;

  items.forEach((item) => {
    const total = item.quantity * item.unitCost;
    if (item.category === 'raw_material') rawMaterialCost += total;
    else if (item.category === 'packaging') packagingCost += total;
    else if (item.category === 'direct_labor') directLaborCost += total;
    else otherDirectCost += total;
  });

  const totalDirectCosts = rawMaterialCost + packagingCost + directLaborCost + otherDirectCost;

  return {
    totalDirectCosts,
    rawMaterialCost,
    packagingCost,
    directLaborCost,
    otherDirectCost,
  };
}

export function calculateGgfUnitCost(ggfItems: GGFItem[], totalDirectCosts: number, targetMonthlyVolume: number): { totalGgfUnitCost: number; updatedGgfItems: GGFItem[] } {
  const safeVolume = Math.max(1, targetMonthlyVolume || 1);
  
  const updatedGgfItems = ggfItems.map((item) => {
    let calculatedUnit = 0;
    if (item.allocationType === 'percentage_direct_cost') {
      calculatedUnit = totalDirectCosts * ((item.value || 0) / 100);
    } else if (item.allocationType === 'fixed_monthly_rate') {
      calculatedUnit = (item.value || 0) / safeVolume;
    } else {
      // fixed_per_unit
      calculatedUnit = item.value || 0;
    }
    return {
      ...item,
      calculatedUnitCost: Number(calculatedUnit.toFixed(4)),
    };
  });

  const totalGgfUnitCost = updatedGgfItems.reduce((acc, curr) => acc + curr.calculatedUnitCost, 0);

  return {
    totalGgfUnitCost,
    updatedGgfItems,
  };
}

export function calculateEffectiveTaxRate(taxSettings: TaxSettings): number {
  if (taxSettings.regime === 'simples_nacional') {
    return taxSettings.simplesRate || 0;
  }
  if (taxSettings.regime === 'mei') {
    // MEI has a fixed monthly DAS, effective rate per sale is practically ~0% or user custom
    return taxSettings.customTaxRate || 0;
  }
  if (taxSettings.regime === 'custom') {
    return taxSettings.customTaxRate || 0;
  }
  // Lucro Presumido / Lucro Real: Sum of itemized taxes
  const sum = 
    (taxSettings.icms || 0) +
    (taxSettings.pis || 0) +
    (taxSettings.cofins || 0) +
    (taxSettings.ipi || 0) +
    (taxSettings.iss || 0) +
    (taxSettings.irpjCsll || 0);
  return Number(sum.toFixed(2));
}

export function calculateTotalVariableRate(variableExpenses: VariableExpenses): number {
  return Number((
    (variableExpenses.salesCommissionRate || 0) +
    (variableExpenses.cardGatewayRate || 0) +
    (variableExpenses.marketplacePlatformRate || 0) +
    (variableExpenses.otherVariableRate || 0)
  ).toFixed(2));
}

export function calculateProductPricing(product: ProductItem): CalculationResult {
  const { totalDirectCosts, rawMaterialCost, packagingCost, directLaborCost, otherDirectCost } = calculateDirectCosts(product.directCosts || []);
  
  const targetVolume = Math.max(1, product.targetSalesVolume || 1);
  const { totalGgfUnitCost } = calculateGgfUnitCost(product.ggfItems || [], totalDirectCosts, targetVolume);

  const totalProductionCostUnit = totalDirectCosts + totalGgfUnitCost;

  // Fixed Expense Allocation
  const fixedAlloc = product.fixedExpenseAllocation || { monthlyFixedExpenses: 0, estimatedMonthlyVolume: 100, costPerUnit: 0 };
  const globalVolume = Math.max(1, fixedAlloc.estimatedMonthlyVolume || 100);
  const totalFixedExpensesUnit = fixedAlloc.monthlyFixedExpenses ? (fixedAlloc.monthlyFixedExpenses / globalVolume) : (fixedAlloc.costPerUnit || 0);

  const shippingUnitCost = product.variableExpenses?.shippingUnitCost || 0;
  const totalUnitCost = totalProductionCostUnit + totalFixedExpensesUnit + shippingUnitCost;

  // Deduction Rates
  const totalTaxRate = calculateEffectiveTaxRate(product.taxSettings);
  const totalVariableRate = calculateTotalVariableRate(product.variableExpenses);
  const desiredProfitRate = product.desiredProfitMargin || 0;

  const totalDeductionsRate = totalTaxRate + totalVariableRate + desiredProfitRate;

  // Markup Divisor (Margem por Dentro)
  // PV = BaseCost / (1 - (Taxes% + Var% + Profit%) / 100)
  const divisorFactor = 1 - (totalDeductionsRate / 100);
  const safeDivisor = divisorFactor > 0.02 ? divisorFactor : 0.02;

  const baseCostToCover = totalProductionCostUnit + totalFixedExpensesUnit + shippingUnitCost;
  const suggestedSalePrice = Number((baseCostToCover / safeDivisor).toFixed(2));

  // Determine Effective Selling Price
  let effectiveSalePrice = suggestedSalePrice;
  if (product.pricingMethod === 'markup_multiplier') {
    // Multiplier over direct cost or total cost
    const markupMult = 1 + (desiredProfitRate / 100);
    effectiveSalePrice = Number((baseCostToCover * markupMult).toFixed(2));
  } else if (product.pricingMethod === 'target_price' && product.manualSalePrice && product.manualSalePrice > 0) {
    effectiveSalePrice = product.manualSalePrice;
  } else if (product.manualSalePrice && product.manualSalePrice > 0) {
    effectiveSalePrice = product.manualSalePrice;
  }

  // DRE Unitária Breakdown based on Effective Selling Price
  const grossRevenue = effectiveSalePrice;
  const taxesAmount = Number((grossRevenue * (totalTaxRate / 100)).toFixed(2));
  const netRevenue = Number((grossRevenue - taxesAmount).toFixed(2));

  const percentageVariableAmount = Number((grossRevenue * (totalVariableRate / 100)).toFixed(2));
  const variableExpensesAmount = Number((percentageVariableAmount + shippingUnitCost).toFixed(2));

  // Margem de Contribuição = Receita Líquida - Despesas Variáveis - Custos de Produção (CD + GGF)
  const contributionMarginAmount = Number((netRevenue - variableExpensesAmount - totalProductionCostUnit).toFixed(2));
  const contributionMarginRate = grossRevenue > 0 ? Number(((contributionMarginAmount / grossRevenue) * 100).toFixed(2)) : 0;

  const fixedExpensesAmount = Number(totalFixedExpensesUnit.toFixed(2));
  const netProfitAmount = Number((contributionMarginAmount - fixedExpensesAmount).toFixed(2));
  const netProfitRate = grossRevenue > 0 ? Number(((netProfitAmount / grossRevenue) * 100).toFixed(2)) : 0;

  // Key Indicators
  const markupMultiplier = totalDirectCosts > 0 ? Number((grossRevenue / totalDirectCosts).toFixed(2)) : 1;
  const markupOverTotalCost = totalUnitCost > 0 ? Number((grossRevenue / totalUnitCost).toFixed(2)) : 1;

  // Ponto de Equilíbrio
  // PE = Custos Fixos Totais / Margem de Contribuição Unitária
  const monthlyFixedTotal = fixedAlloc.monthlyFixedExpenses > 0 
    ? fixedAlloc.monthlyFixedExpenses 
    : (totalFixedExpensesUnit * targetVolume);
  
  let breakEvenQuantity = 0;
  let breakEvenRevenue = 0;
  if (contributionMarginAmount > 0) {
    breakEvenQuantity = Math.ceil(monthlyFixedTotal / contributionMarginAmount);
    breakEvenRevenue = Number((breakEvenQuantity * grossRevenue).toFixed(2));
  }

  // Preço Mínimo onde Lucro Líquido = 0 (Ponto de Equilíbrio Unitário)
  const variableAndTaxRate = totalTaxRate + totalVariableRate;
  const minDivisor = 1 - (variableAndTaxRate / 100);
  const minPrice = minDivisor > 0.05 ? (baseCostToCover / minDivisor) : baseCostToCover;
  
  let maximumDiscountRate = 0;
  if (grossRevenue > minPrice && grossRevenue > 0) {
    maximumDiscountRate = Number((((grossRevenue - minPrice) / grossRevenue) * 100).toFixed(2));
  }

  return {
    totalDirectCosts: Number(totalDirectCosts.toFixed(2)),
    rawMaterialCost: Number(rawMaterialCost.toFixed(2)),
    packagingCost: Number(packagingCost.toFixed(2)),
    directLaborCost: Number(directLaborCost.toFixed(2)),
    otherDirectCost: Number(otherDirectCost.toFixed(2)),

    totalGgfUnitCost: Number(totalGgfUnitCost.toFixed(2)),
    totalProductionCostUnit: Number(totalProductionCostUnit.toFixed(2)),
    totalFixedExpensesUnit: Number(totalFixedExpensesUnit.toFixed(2)),
    totalUnitCost: Number(totalUnitCost.toFixed(2)),

    totalDeductionsRate: Number(totalDeductionsRate.toFixed(2)),
    totalTaxRate,
    totalVariableRate,
    desiredProfitRate,

    markupDivisorFactor: Number(safeDivisor.toFixed(4)),
    suggestedSalePrice,
    effectiveSalePrice,

    grossRevenue,
    taxesAmount,
    netRevenue,
    variableExpensesAmount,
    contributionMarginAmount,
    contributionMarginRate,
    fixedExpensesAmount,
    netProfitAmount,
    netProfitRate,

    markupMultiplier,
    markupOverTotalCost,
    breakEvenQuantity,
    breakEvenRevenue,
    maximumDiscountRate: Math.max(0, maximumDiscountRate),
  };
}

export function formatCurrencyBRL(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '0,00%';
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
}

export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
}
