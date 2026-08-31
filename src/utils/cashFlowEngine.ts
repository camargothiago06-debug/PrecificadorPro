import { ProductItem, CashFlowMonthForecast } from '../types';
import { calculateProductPricing } from './pricingCalculator';

export interface CashFlowSettings {
  projectionMonths: number; // typically 6 or 12
  initialCashBalance: number; // R$ Saldo de Caixa Inicial
  monthlyGrowthRate: number; // % crescimento mensal esperado
  defaultReceivableLagDays: number; // 0, 30, 60
}

export function generateCashFlowForecast(
  products: ProductItem[],
  settings: CashFlowSettings
): {
  monthlyData: CashFlowMonthForecast[];
  summary: {
    totalRevenue: number;
    totalInflow: number;
    totalOutflow: number;
    netOperatingCash: number;
    minimumCashBalance: number;
    finalCashBalance: number;
    workingCapitalNeed: number; // Necessidade de Capital de Giro
  };
} {
  const monthsCount = Math.max(3, Math.min(24, settings.projectionMonths || 6));
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();

  // Pre-calculate per-product monthly base numbers
  const productMetrics = products.map((product) => {
    const calc = calculateProductPricing(product);
    const baseVolume = product.targetSalesVolume || 0;
    const monthlyGrossInvoiced = baseVolume * calc.effectiveSalePrice;
    const monthlyRawCost = baseVolume * (calc.rawMaterialCost + calc.packagingCost);
    const monthlyLaborCost = baseVolume * calc.directLaborCost;
    const monthlyGgfCost = baseVolume * calc.totalGgfUnitCost;
    const monthlyFixedCost = baseVolume * calc.totalFixedExpensesUnit;
    const monthlyTaxes = baseVolume * calc.taxesAmount;
    const monthlyVariables = baseVolume * calc.variableExpensesAmount;

    return {
      product,
      calc,
      baseVolume,
      monthlyGrossInvoiced,
      monthlyRawCost,
      monthlyLaborCost,
      monthlyGgfCost,
      monthlyFixedCost,
      monthlyTaxes,
      monthlyVariables,
      receivableLagMonths: (product.receivableDays || settings.defaultReceivableLagDays || 30) > 20 ? 1 : 0,
      payableLagMonths: (product.payableDays || 15) > 20 ? 1 : 0,
    };
  });

  const monthlyData: CashFlowMonthForecast[] = [];
  let currentCumulativeBalance = settings.initialCashBalance || 0;
  let minCumulativeBalance = currentCumulativeBalance;

  let grandTotalRevenue = 0;
  let grandTotalInflow = 0;
  let grandTotalOutflow = 0;

  // Track delayed receivables and payables across timeline
  const scheduledInflows: number[] = new Array(monthsCount + 2).fill(0);
  const scheduledTaxOutflows: number[] = new Array(monthsCount + 2).fill(0);
  const scheduledSupplierOutflows: number[] = new Array(monthsCount + 2).fill(0);

  // Initialize month 0 with realistic ongoing baseline if needed
  productMetrics.forEach((m) => {
    if (m.receivableLagMonths > 0) {
      scheduledInflows[0] += m.monthlyGrossInvoiced * 0.85; // Previous month sales maturing
    }
    if (m.payableLagMonths > 0) {
      scheduledSupplierOutflows[0] += m.monthlyRawCost * 0.85;
    }
    scheduledTaxOutflows[0] += m.monthlyTaxes * 0.85; // Last month taxes due on 20th
  });

  for (let i = 0; i < monthsCount; i++) {
    const calendarMonthIndex = (currentMonthIdx + i) % 12;
    const growthFactor = Math.pow(1 + (settings.monthlyGrowthRate || 0) / 100, i);

    let monthGrossInvoiced = 0;
    let monthTotalUnits = 0;
    let monthDirectLabor = 0;
    let monthGgf = 0;
    let monthFixed = 0;
    let monthVariables = 0;

    productMetrics.forEach((m) => {
      const scaledUnits = Math.round(m.baseVolume * growthFactor);
      monthTotalUnits += scaledUnits;

      const scaledInvoiced = scaledUnits * m.calc.effectiveSalePrice;
      monthGrossInvoiced += scaledInvoiced;

      const scaledRaw = scaledUnits * (m.calc.rawMaterialCost + m.calc.packagingCost);
      const scaledLabor = scaledUnits * m.calc.directLaborCost;
      const scaledGgf = scaledUnits * m.calc.totalGgfUnitCost;
      const scaledFixed = scaledUnits * m.calc.totalFixedExpensesUnit;
      const scaledTaxes = scaledUnits * m.calc.taxesAmount;
      const scaledVariables = scaledUnits * m.calc.variableExpensesAmount;

      monthDirectLabor += scaledLabor;
      monthGgf += scaledGgf;
      monthFixed += scaledFixed;
      monthVariables += scaledVariables;

      // Inflow schedule based on receivable terms
      if (m.receivableLagMonths === 0) {
        scheduledInflows[i] += scaledInvoiced;
      } else {
        // 30% cash/pix, 70% next month (credit/prazo)
        scheduledInflows[i] += scaledInvoiced * 0.3;
        scheduledInflows[i + 1] += scaledInvoiced * 0.7;
      }

      // Supplier payment schedule
      if (m.payableLagMonths === 0) {
        scheduledSupplierOutflows[i] += scaledRaw;
      } else {
        scheduledSupplierOutflows[i] += scaledRaw * 0.4;
        scheduledSupplierOutflows[i + 1] += scaledRaw * 0.6;
      }

      // Taxes are collected on the 20th of the following month (standard DAS/ICMS/PIS/COFINS)
      scheduledTaxOutflows[i + 1] += scaledTaxes;
    });

    const cashInflowReceived = Number(scheduledInflows[i].toFixed(2));
    const rawMaterialPayment = Number(scheduledSupplierOutflows[i].toFixed(2));
    const ggfPayment = Number(monthGgf.toFixed(2));
    const fixedExpensesPayment = Number((monthFixed + monthDirectLabor).toFixed(2));
    const taxesPayment = Number(scheduledTaxOutflows[i].toFixed(2));
    const variablesAndCommissionsPayment = Number(monthVariables.toFixed(2));

    const totalCashOutflow = Number((
      rawMaterialPayment +
      ggfPayment +
      fixedExpensesPayment +
      taxesPayment +
      variablesAndCommissionsPayment
    ).toFixed(2));

    const netOperatingCash = Number((cashInflowReceived - totalCashOutflow).toFixed(2));
    currentCumulativeBalance = Number((currentCumulativeBalance + netOperatingCash).toFixed(2));

    if (currentCumulativeBalance < minCumulativeBalance) {
      minCumulativeBalance = currentCumulativeBalance;
    }

    grandTotalRevenue += monthGrossInvoiced;
    grandTotalInflow += cashInflowReceived;
    grandTotalOutflow += totalCashOutflow;

    monthlyData.push({
      monthIndex: i + 1,
      monthName: `${monthNames[calendarMonthIndex]} ${currentDate.getFullYear() + (currentMonthIdx + i >= 12 ? 1 : 0)}`,
      projectedUnits: monthTotalUnits,
      grossSalesInvoiced: Number(monthGrossInvoiced.toFixed(2)),
      cashInflowReceived,
      rawMaterialPayment,
      ggfPayment,
      fixedExpensesPayment,
      taxesPayment,
      variablesAndCommissionsPayment,
      totalCashOutflow,
      netOperatingCash,
      cumulativeCashBalance: currentCumulativeBalance,
    });
  }

  // Working capital need is the lowest trough under initial balance or 0
  const workingCapitalNeed = minCumulativeBalance < 0 ? Math.abs(minCumulativeBalance) : 0;

  return {
    monthlyData,
    summary: {
      totalRevenue: Number(grandTotalRevenue.toFixed(2)),
      totalInflow: Number(grandTotalInflow.toFixed(2)),
      totalOutflow: Number(grandTotalOutflow.toFixed(2)),
      netOperatingCash: Number((grandTotalInflow - grandTotalOutflow).toFixed(2)),
      minimumCashBalance: Number(minCumulativeBalance.toFixed(2)),
      finalCashBalance: Number(currentCumulativeBalance.toFixed(2)),
      workingCapitalNeed: Number(workingCapitalNeed.toFixed(2)),
    },
  };
}
