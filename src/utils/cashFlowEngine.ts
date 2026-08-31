import { ProductItem, CashFlowMonthForecast } from '../types';
import { calculateProductPricing } from './pricingCalculator';
import { calculateAverageDays, getInstallmentsForPreset } from './paymentTerms';

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
    averageReceivableDays: number; // Prazo Médio de Recebimento Ponderado (PMR)
    averagePayableDays: number; // Prazo Médio de Pagamento Ponderado (PMP)
    financialCycleDays: number; // Ciclo Financeiro (PMR - PMP)
  };
} {
  const monthsCount = Math.max(3, Math.min(24, settings.projectionMonths || 6));
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();

  // Helper to get normalized installments array for receivables/payables
  const getProductInstallments = (
    installments?: number[],
    termsType?: string,
    customStr?: string,
    fallbackDays: number = 30
  ): number[] => {
    if (installments && installments.length > 0) {
      return installments;
    }
    if (termsType) {
      return getInstallmentsForPreset(termsType, customStr);
    }
    if (fallbackDays === 0) return [0];
    if (fallbackDays === 15) return [15];
    if (fallbackDays === 30) return [30];
    if (fallbackDays === 45) return [30, 60];
    if (fallbackDays === 60) return [30, 60, 90];
    if (fallbackDays === 75) return [30, 60, 90, 120];
    return [fallbackDays];
  };

  let totalWeightedRevenue = 0;
  let totalWeightedReceivableDays = 0;
  let totalWeightedRawCost = 0;
  let totalWeightedPayableDays = 0;

  // Pre-calculate per-product monthly base numbers and installment splits
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

    const recInstallments = getProductInstallments(
      product.receivableInstallments,
      product.receivableTermsType,
      product.receivableTermsCustom,
      product.receivableDays ?? 30
    );

    const payInstallments = getProductInstallments(
      product.payableInstallments,
      product.payableTermsType,
      product.payableTermsCustom,
      product.payableDays ?? 15
    );

    const effectivePmr = product.receivableDays ?? calculateAverageDays(recInstallments);
    const effectivePmp = product.payableDays ?? calculateAverageDays(payInstallments);

    totalWeightedRevenue += monthlyGrossInvoiced;
    totalWeightedReceivableDays += monthlyGrossInvoiced * effectivePmr;

    totalWeightedRawCost += monthlyRawCost;
    totalWeightedPayableDays += monthlyRawCost * effectivePmp;

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
      recInstallments,
      payInstallments,
      effectivePmr,
      effectivePmp,
    };
  });

  const averageReceivableDays = totalWeightedRevenue > 0
    ? Math.round((totalWeightedReceivableDays / totalWeightedRevenue) * 10) / 10
    : 30;

  const averagePayableDays = totalWeightedRawCost > 0
    ? Math.round((totalWeightedPayableDays / totalWeightedRawCost) * 10) / 10
    : 15;

  const financialCycleDays = Math.round((averageReceivableDays - averagePayableDays) * 10) / 10;

  const monthlyData: CashFlowMonthForecast[] = [];
  let currentCumulativeBalance = settings.initialCashBalance || 0;
  let minCumulativeBalance = currentCumulativeBalance;

  let grandTotalRevenue = 0;
  let grandTotalInflow = 0;
  let grandTotalOutflow = 0;

  // Track delayed receivables and payables across timeline (allocating safe buffer of +12 months)
  const maxHorizon = monthsCount + 12;
  const scheduledInflows: number[] = new Array(maxHorizon).fill(0);
  const scheduledTaxOutflows: number[] = new Array(maxHorizon).fill(0);
  const scheduledSupplierOutflows: number[] = new Array(maxHorizon).fill(0);

  // Initialize month 0 baseline for ongoing rolling contracts (past months maturing now)
  productMetrics.forEach((m) => {
    // Mature prior receivables
    m.recInstallments.forEach((days) => {
      const portion = (m.monthlyGrossInvoiced / m.recInstallments.length) * 0.9;
      const monthLag = Math.round(days / 30);
      if (monthLag > 0) {
        scheduledInflows[0] += portion;
      }
    });

    // Mature prior supplier payments
    m.payInstallments.forEach((days) => {
      const portion = (m.monthlyRawCost / m.payInstallments.length) * 0.9;
      const monthLag = Math.round(days / 30);
      if (monthLag > 0) {
        scheduledSupplierOutflows[0] += portion;
      }
    });

    // Taxes from previous month
    scheduledTaxOutflows[0] += m.monthlyTaxes * 0.85;
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

      // Inflow schedule distributed across exact installment terms (30, 60, 90, 120 days etc)
      const recPartAmount = scaledInvoiced / Math.max(1, m.recInstallments.length);
      m.recInstallments.forEach((days) => {
        const monthLag = Math.max(0, Math.round(days / 30));
        const targetIndex = i + monthLag;
        if (targetIndex < maxHorizon) {
          scheduledInflows[targetIndex] += recPartAmount;
        }
      });

      // Supplier payment schedule distributed across exact installment terms
      const payPartAmount = scaledRaw / Math.max(1, m.payInstallments.length);
      m.payInstallments.forEach((days) => {
        const monthLag = Math.max(0, Math.round(days / 30));
        const targetIndex = i + monthLag;
        if (targetIndex < maxHorizon) {
          scheduledSupplierOutflows[targetIndex] += payPartAmount;
        }
      });

      // Taxes are collected on the 20th of the following month (standard DAS/ICMS/PIS/COFINS)
      if (i + 1 < maxHorizon) {
        scheduledTaxOutflows[i + 1] += scaledTaxes;
      }
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
      averageReceivableDays,
      averagePayableDays,
      financialCycleDays,
    },
  };
}
