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
    return taxSettings.customTaxRate || 0;
  }
  if (taxSettings.regime === 'custom') {
    return taxSettings.customTaxRate || 0;
  }
  
  if (taxSettings.regime === 'lucro_real') {
    // No Lucro Real, os tributos diretos sobre a receita de venda são:
    // PIS (1,65%) + COFINS (7,60%) + ICMS (ex: 18%) + IPI (ex: 5%) + ISS (se serviço)
    const pisRate = taxSettings.pis !== undefined ? taxSettings.pis : 1.65;
    const cofinsRate = taxSettings.cofins !== undefined ? taxSettings.cofins : 7.60;
    const icmsRate = taxSettings.icms || 0;
    const ipiRate = taxSettings.ipi || 0;
    const issRate = taxSettings.iss || 0;
    
    // IRPJ/CSLL no Lucro Real incide sobre o Lucro Líquido Real (LAIR), não sobre a venda bruta!
    return Number((pisRate + cofinsRate + icmsRate + ipiRate + issRate).toFixed(2));
  }

  // Lucro Presumido: Soma dos tributos sobre faturamento
  const sum = 
    (taxSettings.icms || 0) +
    (taxSettings.pis !== undefined ? taxSettings.pis : 0.65) +
    (taxSettings.cofins !== undefined ? taxSettings.cofins : 3.00) +
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
  const isLucroReal = product.taxSettings?.regime === 'lucro_real';
  const { totalDirectCosts, rawMaterialCost, packagingCost, directLaborCost, otherDirectCost } = calculateDirectCosts(product.directCosts || []);
  
  const targetVolume = Math.max(1, product.targetSalesVolume || 1);
  const { totalGgfUnitCost, updatedGgfItems } = calculateGgfUnitCost(product.ggfItems || [], totalDirectCosts, targetVolume);

  // Lucro Real: Cálculo de Créditos Tributários na Entrada (Regime Não-Cumulativo)
  // Empresas no Lucro Real tomam créditos de PIS (1,65%) e COFINS (7,60%) = 9,25% sobre matérias-primas, insumos e energia elétrica da fábrica
  let totalTaxCreditsUnit = 0;
  let pisTaxCreditUnit = 0;
  let cofinsTaxCreditUnit = 0;
  let icmsTaxCreditUnit = 0;

  const takeCredits = isLucroReal && product.taxSettings?.takeRawMaterialTaxCredits !== false;
  if (takeCredits) {
    const pisCreditRate = (product.taxSettings?.pisCreditRate !== undefined ? product.taxSettings.pisCreditRate : 1.65) / 100;
    const cofinsCreditRate = (product.taxSettings?.cofinsCreditRate !== undefined ? product.taxSettings.cofinsCreditRate : 7.60) / 100;
    const icmsCreditRate = (product.taxSettings?.icmsCreditRate || 0) / 100;

    // Crédito sobre matéria-prima e embalagens
    const eligibleInputs = rawMaterialCost + packagingCost;
    pisTaxCreditUnit += eligibleInputs * pisCreditRate;
    cofinsTaxCreditUnit += eligibleInputs * cofinsCreditRate;
    icmsTaxCreditUnit += eligibleInputs * icmsCreditRate;

    // Crédito sobre Energia Elétrica industrial no GGF
    const energyGgf = updatedGgfItems
      .filter(g => g.category === 'energy')
      .reduce((sum, g) => sum + g.calculatedUnitCost, 0);
    
    pisTaxCreditUnit += energyGgf * pisCreditRate;
    cofinsTaxCreditUnit += energyGgf * cofinsCreditRate;

    totalTaxCreditsUnit = Number((pisTaxCreditUnit + cofinsTaxCreditUnit + icmsTaxCreditUnit).toFixed(2));
  }

  const netDirectCostsAfterCredits = Number(Math.max(0, totalDirectCosts - totalTaxCreditsUnit).toFixed(2));
  const effectiveDirectCostToUse = takeCredits ? netDirectCostsAfterCredits : totalDirectCosts;

  const totalProductionCostUnit = effectiveDirectCostToUse + totalGgfUnitCost;

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

  // Lucro Real IRPJ & CSLL:
  // No Lucro Real, IRPJ (15% + 10% adicional) e CSLL (9%) = 34% incidem sobre o Lucro Real / LAIR (Lucro Antes do IR/CSLL)
  // Para obter X% de lucro líquido final pós-IRPJ/CSLL, a margem bruta pré-imposto (LAIR) necessária é: DesiredProfit% / (1 - 0.34) = DesiredProfit% / 0.66
  const irpjCsllRealRate = product.taxSettings?.totalIrpjCsllRealRate !== undefined ? product.taxSettings.totalIrpjCsllRealRate : 34;
  const preTaxProfitMarginRequired = isLucroReal && irpjCsllRealRate > 0
    ? desiredProfitRate / (1 - (irpjCsllRealRate / 100))
    : desiredProfitRate;

  const totalDeductionsRate = totalTaxRate + totalVariableRate + preTaxProfitMarginRequired;

  // Markup Divisor (Margem por Dentro)
  // PV = BaseCost / (1 - (Taxes% + Var% + LAIR%) / 100)
  const divisorFactor = 1 - (totalDeductionsRate / 100);
  const safeDivisor = divisorFactor > 0.02 ? divisorFactor : 0.02;

  const baseCostToCover = totalProductionCostUnit + totalFixedExpensesUnit + shippingUnitCost;
  const suggestedSalePrice = Number((baseCostToCover / safeDivisor).toFixed(2));

  // Determine Effective Selling Price
  let effectiveSalePrice = suggestedSalePrice;
  if (product.pricingMethod === 'markup_multiplier') {
    const markupMult = 1 + (desiredProfitRate / 100);
    effectiveSalePrice = Number((baseCostToCover * markupMult).toFixed(2));
  } else if (product.pricingMethod === 'target_price' && product.manualSalePrice && product.manualSalePrice > 0) {
    effectiveSalePrice = product.manualSalePrice;
  } else if (product.manualSalePrice && product.manualSalePrice > 0) {
    effectiveSalePrice = product.manualSalePrice;
  }

  // DRE Unitária Breakdown based on Effective Selling Price
  const grossRevenue = effectiveSalePrice;
  
  // Detalhamento de impostos sobre o faturamento de venda
  let icmsAmount = 0;
  let pisAmount = 0;
  let cofinsAmount = 0;
  let ipiAmount = 0;
  let issAmount = 0;

  if (isLucroReal) {
    const pisRate = product.taxSettings?.pis !== undefined ? product.taxSettings.pis : 1.65;
    const cofinsRate = product.taxSettings?.cofins !== undefined ? product.taxSettings.cofins : 7.60;
    const icmsRate = product.taxSettings?.icms || 0;
    const ipiRate = product.taxSettings?.ipi || 0;
    const issRate = product.taxSettings?.iss || 0;

    pisAmount = Number((grossRevenue * (pisRate / 100)).toFixed(2));
    cofinsAmount = Number((grossRevenue * (cofinsRate / 100)).toFixed(2));
    icmsAmount = Number((grossRevenue * (icmsRate / 100)).toFixed(2));
    ipiAmount = Number((grossRevenue * (ipiRate / 100)).toFixed(2));
    issAmount = Number((grossRevenue * (issRate / 100)).toFixed(2));
  } else if (product.taxSettings?.regime === 'lucro_presumido') {
    icmsAmount = Number((grossRevenue * ((product.taxSettings.icms || 0) / 100)).toFixed(2));
    pisAmount = Number((grossRevenue * ((product.taxSettings.pis || 0.65) / 100)).toFixed(2));
    cofinsAmount = Number((grossRevenue * ((product.taxSettings.cofins || 3.0) / 100)).toFixed(2));
    ipiAmount = Number((grossRevenue * ((product.taxSettings.ipi || 0) / 100)).toFixed(2));
  }

  const taxesAmount = Number((grossRevenue * (totalTaxRate / 100)).toFixed(2));
  const netRevenue = Number((grossRevenue - taxesAmount).toFixed(2));

  const percentageVariableAmount = Number((grossRevenue * (totalVariableRate / 100)).toFixed(2));
  const variableExpensesAmount = Number((percentageVariableAmount + shippingUnitCost).toFixed(2));

  // Margem de Contribuição = Receita Líquida - Despesas Variáveis - Custos de Produção (CD + GGF)
  const contributionMarginAmount = Number((netRevenue - variableExpensesAmount - totalProductionCostUnit).toFixed(2));
  const contributionMarginRate = grossRevenue > 0 ? Number(((contributionMarginAmount / grossRevenue) * 100).toFixed(2)) : 0;

  const fixedExpensesAmount = Number(totalFixedExpensesUnit.toFixed(2));

  // LAIR (Lucro Antes do IRPJ e CSLL)
  const lairAmount = Number((contributionMarginAmount - fixedExpensesAmount).toFixed(2));
  const lairRate = grossRevenue > 0 ? Number(((lairAmount / grossRevenue) * 100).toFixed(2)) : 0;

  // Provisão IRPJ (15% + 10%) e CSLL (9%) no Lucro Real (Total 34%)
  let irpjCsllProfitTaxAmount = 0;
  if (isLucroReal && lairAmount > 0 && irpjCsllRealRate > 0) {
    irpjCsllProfitTaxAmount = Number((lairAmount * (irpjCsllRealRate / 100)).toFixed(2));
  }

  // Lucro Líquido Real Final
  const netProfitAmount = Number((lairAmount - irpjCsllProfitTaxAmount).toFixed(2));
  const netProfitRate = grossRevenue > 0 ? Number(((netProfitAmount / grossRevenue) * 100).toFixed(2)) : 0;

  // Key Indicators
  const markupMultiplier = totalDirectCosts > 0 ? Number((grossRevenue / totalDirectCosts).toFixed(2)) : 1;
  const markupOverTotalCost = totalUnitCost > 0 ? Number((grossRevenue / totalUnitCost).toFixed(2)) : 1;

  // Ponto de Equilíbrio
  const monthlyFixedTotal = fixedAlloc.monthlyFixedExpenses > 0 
    ? fixedAlloc.monthlyFixedExpenses 
    : (totalFixedExpensesUnit * targetVolume);
  
  let breakEvenQuantity = 0;
  let breakEvenRevenue = 0;
  if (contributionMarginAmount > 0) {
    breakEvenQuantity = Math.ceil(monthlyFixedTotal / contributionMarginAmount);
    breakEvenRevenue = Number((breakEvenQuantity * grossRevenue).toFixed(2));
  }

  // Preço Mínimo onde Lucro Líquido = 0
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

    // Lucro Real Credits
    isLucroReal,
    totalTaxCreditsUnit,
    rawMaterialTaxCreditsAmount: totalTaxCreditsUnit,
    pisTaxCreditUnit: Number(pisTaxCreditUnit.toFixed(2)),
    cofinsTaxCreditUnit: Number(cofinsTaxCreditUnit.toFixed(2)),
    icmsTaxCreditUnit: Number(icmsTaxCreditUnit.toFixed(2)),
    netDirectCostsAfterCredits,

    totalDeductionsRate: Number(totalDeductionsRate.toFixed(2)),
    totalTaxRate,
    totalVariableRate,
    desiredProfitRate,

    markupDivisorFactor: Number(safeDivisor.toFixed(4)),
    suggestedSalePrice,
    effectiveSalePrice,

    grossRevenue,
    taxesAmount,
    icmsAmount,
    pisAmount,
    cofinsAmount,
    ipiAmount,
    issAmount,
    netRevenue,
    variableExpensesAmount,
    contributionMarginAmount,
    contributionMarginRate,
    fixedExpensesAmount,

    // Lucro Real DRE
    lairAmount,
    lairRate,
    irpjCsllProfitTaxAmount,
    irpjCsllRealAmount: irpjCsllProfitTaxAmount,
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
