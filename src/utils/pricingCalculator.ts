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

export function calculateGgfUnitCost(
  ggfItems: GGFItem[], 
  totalDirectCosts: number, 
  targetMonthlyVolume: number,
  netWeightKg: number = 1.0,
  factoryMonthlyKgCapacity?: number
): { totalGgfUnitCost: number; ggfPerKg: number; updatedGgfItems: GGFItem[] } {
  const safeVolume = Math.max(1, targetMonthlyVolume || 1);
  const weight = Math.max(0.0001, netWeightKg || 1.0);
  const factoryKg = Math.max(1, factoryMonthlyKgCapacity || (safeVolume * weight));
  
  const updatedGgfItems = ggfItems.map((item) => {
    let calculatedUnit = 0;
    let calculatedKg = 0;

    if (item.allocationType === 'rate_per_kg') {
      // Rateio do total de GGF pelo total de kg da fábrica no mês: (R$ total mês / Total kg fábrica) * Peso líquido (kg)
      calculatedKg = (item.value || 0) / factoryKg;
      calculatedUnit = calculatedKg * weight;
    } else if (item.allocationType === 'fixed_per_kg') {
      // Valor direto de GGF por kg (ex: R$ 3,50 por kg)
      calculatedKg = item.value || 0;
      calculatedUnit = calculatedKg * weight;
    } else if (item.allocationType === 'percentage_direct_cost') {
      // % sobre o custo direto total
      calculatedUnit = totalDirectCosts * ((item.value || 0) / 100);
      calculatedKg = calculatedUnit / weight;
    } else if (item.allocationType === 'fixed_monthly_rate') {
      // R$ total mensal dividido pelas unidades
      calculatedUnit = (item.value || 0) / safeVolume;
      calculatedKg = calculatedUnit / weight;
    } else {
      // fixed_per_unit: R$ fixo por unidade
      calculatedUnit = item.value || 0;
      calculatedKg = calculatedUnit / weight;
    }

    return {
      ...item,
      calculatedUnitCost: Number(calculatedUnit.toFixed(4)),
      calculatedCostPerKg: Number(calculatedKg.toFixed(4)),
    };
  });

  const totalGgfUnitCost = updatedGgfItems.reduce((acc, curr) => acc + curr.calculatedUnitCost, 0);
  const ggfPerKg = totalGgfUnitCost / weight;

  return {
    totalGgfUnitCost: Number(totalGgfUnitCost.toFixed(2)),
    ggfPerKg: Number(ggfPerKg.toFixed(2)),
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
  const netWeightKg = Math.max(0.0001, product.netWeightKg !== undefined ? product.netWeightKg : 1.0);
  const unitOfMeasure = product.unitOfMeasure || 'un';
  const targetVolume = Math.max(1, product.targetSalesVolume || 1);
  const totalMonthlyKg = targetVolume * netWeightKg;

  const { totalDirectCosts, rawMaterialCost, packagingCost, directLaborCost, otherDirectCost } = calculateDirectCosts(product.directCosts || []);
  
  // Factory Monthly Capacity in Kg (used for rateio by kg of factory)
  const factoryKgCapacity = product.factoryMonthlyKgCapacity || product.fixedExpenseAllocation?.estimatedMonthlyKgVolume || totalMonthlyKg;

  const { totalGgfUnitCost, ggfPerKg, updatedGgfItems } = calculateGgfUnitCost(
    product.ggfItems || [], 
    totalDirectCosts, 
    targetVolume,
    netWeightKg,
    factoryKgCapacity
  );

  // Lucro Real: Cálculo de Créditos Tributários na Entrada (Regime Não-Cumulativo)
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

  // Fixed Expense Allocation (Rateio por kg ou por unidade)
  const fixedAlloc = product.fixedExpenseAllocation || { monthlyFixedExpenses: 0, estimatedMonthlyVolume: 100, costPerUnit: 0 };
  let totalFixedExpensesUnit = 0;
  let fixedExpensesPerKg = 0;

  if (fixedAlloc.allocationBasis === 'units' && fixedAlloc.monthlyFixedExpenses > 0) {
    const globalVolume = Math.max(1, fixedAlloc.estimatedMonthlyVolume || 100);
    totalFixedExpensesUnit = fixedAlloc.monthlyFixedExpenses / globalVolume;
    fixedExpensesPerKg = totalFixedExpensesUnit / netWeightKg;
  } else if (fixedAlloc.monthlyFixedExpenses > 0) {
    // Padrão: Rateio por Kilograma (kg)
    const globalKgVolume = Math.max(1, fixedAlloc.estimatedMonthlyKgVolume || (fixedAlloc.estimatedMonthlyVolume * netWeightKg) || totalMonthlyKg);
    fixedExpensesPerKg = fixedAlloc.monthlyFixedExpenses / globalKgVolume;
    totalFixedExpensesUnit = fixedExpensesPerKg * netWeightKg;
  } else if (fixedAlloc.costPerKg && fixedAlloc.costPerKg > 0) {
    fixedExpensesPerKg = fixedAlloc.costPerKg;
    totalFixedExpensesUnit = fixedExpensesPerKg * netWeightKg;
  } else {
    totalFixedExpensesUnit = fixedAlloc.costPerUnit || 0;
    fixedExpensesPerKg = totalFixedExpensesUnit / netWeightKg;
  }

  const shippingUnitCost = product.variableExpenses?.shippingUnitCost || 0;
  const shippingPerKg = shippingUnitCost / netWeightKg;
  const totalUnitCost = totalProductionCostUnit + totalFixedExpensesUnit + shippingUnitCost;
  const totalCostPerKg = totalUnitCost / netWeightKg;

  // Deduction Rates
  const totalTaxRate = calculateEffectiveTaxRate(product.taxSettings);
  const totalVariableRate = calculateTotalVariableRate(product.variableExpenses);
  const desiredProfitRate = product.desiredProfitMargin || 0;

  // Lucro Real IRPJ & CSLL:
  const irpjCsllRealRate = product.taxSettings?.totalIrpjCsllRealRate !== undefined ? product.taxSettings.totalIrpjCsllRealRate : 34;
  const preTaxProfitMarginRequired = isLucroReal && irpjCsllRealRate > 0
    ? desiredProfitRate / (1 - (irpjCsllRealRate / 100))
    : desiredProfitRate;

  const totalDeductionsRate = totalTaxRate + totalVariableRate + preTaxProfitMarginRequired;

  // Markup Divisor (Margem por Dentro)
  const divisorFactor = 1 - (totalDeductionsRate / 100);
  const safeDivisor = divisorFactor > 0.02 ? divisorFactor : 0.02;

  const baseCostToCover = totalProductionCostUnit + totalFixedExpensesUnit + shippingUnitCost;
  const suggestedSalePrice = Number((baseCostToCover / safeDivisor).toFixed(2));
  const suggestedSalePricePerKg = Number((suggestedSalePrice / netWeightKg).toFixed(2));

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

  const effectiveSalePricePerKg = Number((effectiveSalePrice / netWeightKg).toFixed(2));

  // DRE Unitária Breakdown based on Effective Selling Price
  const grossRevenue = effectiveSalePrice;
  const grossRevenuePerKg = effectiveSalePricePerKg;
  
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
  const taxesPerKg = Number((taxesAmount / netWeightKg).toFixed(2));
  const netRevenue = Number((grossRevenue - taxesAmount).toFixed(2));
  const netRevenuePerKg = Number((netRevenue / netWeightKg).toFixed(2));

  const percentageVariableAmount = Number((grossRevenue * (totalVariableRate / 100)).toFixed(2));
  const variableExpensesAmount = Number((percentageVariableAmount + shippingUnitCost).toFixed(2));
  const variableExpensesPerKg = Number((variableExpensesAmount / netWeightKg).toFixed(2));

  // Margem de Contribuição = Receita Líquida - Despesas Variáveis - Custos de Produção (CD + GGF)
  const contributionMarginAmount = Number((netRevenue - variableExpensesAmount - totalProductionCostUnit).toFixed(2));
  const contributionMarginPerKg = Number((contributionMarginAmount / netWeightKg).toFixed(2));
  const contributionMarginRate = grossRevenue > 0 ? Number(((contributionMarginAmount / grossRevenue) * 100).toFixed(2)) : 0;

  const fixedExpensesAmount = Number(totalFixedExpensesUnit.toFixed(2));

  // LAIR (Lucro Antes do IRPJ e CSLL)
  const lairAmount = Number((contributionMarginAmount - fixedExpensesAmount).toFixed(2));
  const lairPerKg = Number((lairAmount / netWeightKg).toFixed(2));
  const lairRate = grossRevenue > 0 ? Number(((lairAmount / grossRevenue) * 100).toFixed(2)) : 0;

  // Provisão IRPJ (15% + 10%) e CSLL (9%) no Lucro Real (Total 34%)
  let irpjCsllProfitTaxAmount = 0;
  if (isLucroReal && lairAmount > 0 && irpjCsllRealRate > 0) {
    irpjCsllProfitTaxAmount = Number((lairAmount * (irpjCsllRealRate / 100)).toFixed(2));
  }
  const irpjCsllPerKg = Number((irpjCsllProfitTaxAmount / netWeightKg).toFixed(2));

  // Lucro Líquido Real Final
  const netProfitAmount = Number((lairAmount - irpjCsllProfitTaxAmount).toFixed(2));
  const netProfitPerKg = Number((netProfitAmount / netWeightKg).toFixed(2));
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
  let breakEvenKg = 0;

  if (contributionMarginAmount > 0) {
    breakEvenQuantity = Math.ceil(monthlyFixedTotal / contributionMarginAmount);
    breakEvenRevenue = Number((breakEvenQuantity * grossRevenue).toFixed(2));
    breakEvenKg = Number((breakEvenQuantity * netWeightKg).toFixed(2));
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
    netWeightKg,
    unitOfMeasure,
    totalMonthlyKg: Number(totalMonthlyKg.toFixed(2)),

    totalDirectCosts: Number(totalDirectCosts.toFixed(2)),
    directCostPerKg: Number((totalDirectCosts / netWeightKg).toFixed(2)),
    directCostsPerKg: Number((totalDirectCosts / netWeightKg).toFixed(2)),
    rawMaterialCost: Number(rawMaterialCost.toFixed(2)),
    rawMaterialCostPerKg: Number((rawMaterialCost / netWeightKg).toFixed(2)),
    packagingCost: Number(packagingCost.toFixed(2)),
    packagingCostPerKg: Number((packagingCost / netWeightKg).toFixed(2)),
    directLaborCost: Number(directLaborCost.toFixed(2)),
    directLaborCostPerKg: Number((directLaborCost / netWeightKg).toFixed(2)),
    otherDirectCost: Number(otherDirectCost.toFixed(2)),
    otherDirectCostPerKg: Number((otherDirectCost / netWeightKg).toFixed(2)),

    totalGgfUnitCost: Number(totalGgfUnitCost.toFixed(2)),
    ggfPerKg: Number(ggfPerKg.toFixed(2)),
    totalProductionCostUnit: Number(totalProductionCostUnit.toFixed(2)),
    productionCostPerKg: Number((totalProductionCostUnit / netWeightKg).toFixed(2)),
    totalFixedExpensesUnit: Number(totalFixedExpensesUnit.toFixed(2)),
    fixedExpensesPerKg: Number(fixedExpensesPerKg.toFixed(2)),
    fixedExpensePerKg: Number(fixedExpensesPerKg.toFixed(2)),
    totalUnitCost: Number(totalUnitCost.toFixed(2)),
    totalCostPerKg: Number(totalCostPerKg.toFixed(2)),
    shippingPerKg: Number(shippingPerKg.toFixed(2)),

    // Lucro Real Credits
    isLucroReal,
    totalTaxCreditsUnit,
    rawMaterialTaxCreditsAmount: totalTaxCreditsUnit,
    taxCreditsPerKg: Number((totalTaxCreditsUnit / netWeightKg).toFixed(2)),
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
    suggestedSalePricePerKg,
    effectiveSalePrice,
    effectiveSalePricePerKg,

    grossRevenue,
    grossRevenuePerKg,
    taxesAmount,
    taxesPerKg,
    icmsAmount,
    pisAmount,
    cofinsAmount,
    ipiAmount,
    issAmount,
    netRevenue,
    netRevenuePerKg,
    variableExpensesAmount,
    variableExpensesPerKg,
    contributionMarginAmount,
    contributionMarginPerKg,
    contributionMarginRate,
    fixedExpensesAmount,

    // Lucro Real DRE
    lairAmount,
    lairPerKg,
    lairRate,
    irpjCsllProfitTaxAmount,
    irpjCsllRealAmount: irpjCsllProfitTaxAmount,
    irpjCsllPerKg,
    netProfitAmount,
    netProfitPerKg,
    netProfitRate,

    markupMultiplier,
    markupOverTotalCost,
    breakEvenQuantity,
    breakEvenKg,
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

export function formatKg(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '0 kg';
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} kg`;
}

