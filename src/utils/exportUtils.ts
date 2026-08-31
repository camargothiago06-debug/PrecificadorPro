import { ProductItem, CashFlowMonthForecast } from '../types';
import { calculateProductPricing, formatCurrencyBRL, formatPercent } from './pricingCalculator';

export function exportProductsToCSV(products: ProductItem[]) {
  const headers = [
    'Código',
    'Nome do Produto',
    'Categoria',
    'Regime Tributário',
    'Volume Mensal (un)',
    'Custos Diretos (R$)',
    'Insumos/Matéria-Prima (R$)',
    'Crédito Tributário Insumos (R$)',
    'Embalagem (R$)',
    'Mão de Obra Direta (R$)',
    'GGF - Custos Indiretos (R$)',
    'Custo Total de Produção (R$)',
    'Despesas Fixas Rateadas (R$)',
    'Custo Total Unitário (R$)',
    'Impostos Saída (%)',
    'Impostos Saída (R$)',
    'Comissões e Taxas Variáveis (%)',
    'Despesas Variáveis Unit (R$)',
    'Margem de Lucro Desejada (%)',
    'Preço de Venda Sugerido (R$)',
    'Preço de Venda Praticado (R$)',
    'Margem de Contribuição (R$)',
    'Margem de Contribuição (%)',
    'LAIR - Lucro Antes IRPJ/CSLL (R$)',
    'Provisão IRPJ & CSLL 34% (R$)',
    'Lucro Líquido Unitário (R$)',
    'Margem Líquida Efetiva (%)',
    'Ponto de Equilíbrio (unidades)',
    'Ponto de Equilíbrio (R$)',
    'Faturamento Mensal Estimado (R$)',
    'Lucro Líquido Mensal Estimado (R$)',
    'Prazo Médio Recebimento PMR (dias)',
    'Prazo Médio Pagamento PMP (dias)',
  ];

  const rows = products.map((product) => {
    const calc = calculateProductPricing(product);
    const monthlyRev = (product.targetSalesVolume || 0) * calc.effectiveSalePrice;
    const monthlyProfit = (product.targetSalesVolume || 0) * calc.netProfitAmount;

    return [
      `"${product.code}"`,
      `"${product.name.replace(/"/g, '""')}"`,
      `"${product.category}"`,
      `"${product.taxSettings?.regime || 'lucro_real'}"`,
      product.targetSalesVolume,
      calc.totalDirectCosts.toFixed(2),
      calc.rawMaterialCost.toFixed(2),
      calc.rawMaterialTaxCreditsAmount.toFixed(2),
      calc.packagingCost.toFixed(2),
      calc.directLaborCost.toFixed(2),
      calc.totalGgfUnitCost.toFixed(2),
      calc.totalProductionCostUnit.toFixed(2),
      calc.totalFixedExpensesUnit.toFixed(2),
      calc.totalUnitCost.toFixed(2),
      calc.totalTaxRate.toFixed(2),
      calc.taxesAmount.toFixed(2),
      calc.totalVariableRate.toFixed(2),
      calc.variableExpensesAmount.toFixed(2),
      calc.desiredProfitRate.toFixed(2),
      calc.suggestedSalePrice.toFixed(2),
      calc.effectiveSalePrice.toFixed(2),
      calc.contributionMarginAmount.toFixed(2),
      calc.contributionMarginRate.toFixed(2),
      calc.lairAmount.toFixed(2),
      calc.irpjCsllRealAmount.toFixed(2),
      calc.netProfitAmount.toFixed(2),
      calc.netProfitRate.toFixed(2),
      calc.breakEvenQuantity,
      calc.breakEvenRevenue.toFixed(2),
      monthlyRev.toFixed(2),
      monthlyProfit.toFixed(2),
      product.receivableDays ?? 30,
      product.payableDays ?? 15,
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_precificacao_produtos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCashFlowToCSV(monthlyData: CashFlowMonthForecast[]) {
  const headers = [
    'Mês / Período',
    'Unidades Vendidas',
    'Faturamento Bruto (R$)',
    'Entradas Efetivas em Caixa (R$)',
    'Pagamento de Insumos/Matéria-Prima (R$)',
    'Pagamento de GGF / Fábrica (R$)',
    'Despesas Fixas & Salários (R$)',
    'Impostos Pagos (R$)',
    'Comissões & Taxas Cartão (R$)',
    'Total Saídas de Caixa (R$)',
    'Fluxo Operacional Líquido (R$)',
    'Saldo de Caixa Acumulado (R$)',
  ];

  const rows = monthlyData.map((m) => {
    return [
      `"${m.monthName}"`,
      m.projectedUnits,
      m.grossSalesInvoiced.toFixed(2),
      m.cashInflowReceived.toFixed(2),
      m.rawMaterialPayment.toFixed(2),
      m.ggfPayment.toFixed(2),
      m.fixedExpensesPayment.toFixed(2),
      m.taxesPayment.toFixed(2),
      m.variablesAndCommissionsPayment.toFixed(2),
      m.totalCashOutflow.toFixed(2),
      m.netOperatingCash.toFixed(2),
      m.cumulativeCashBalance.toFixed(2),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_fluxo_caixa_previsto_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrintReport() {
  window.print();
}

export function exportDataBackupJSON(products: ProductItem[]) {
  const data = {
    app: 'Precificador Pro',
    exportedAt: new Date().toISOString(),
    products,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `backup_precificador_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
