import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Calendar, 
  Download, 
  Layers, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  Wallet,
  Building2,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { ProductItem } from '../types';
import { generateCashFlowForecast, CashFlowSettings } from '../utils/cashFlowEngine';
import { formatCurrencyBRL, formatPercent } from '../utils/pricingCalculator';
import { exportCashFlowToCSV } from '../utils/exportUtils';

interface CashFlowDashboardProps {
  products: ProductItem[];
}

export const CashFlowDashboard: React.FC<CashFlowDashboardProps> = ({ products }) => {
  const [projectionMonths, setProjectionMonths] = useState<number>(6);
  const [initialCashBalance, setInitialCashBalance] = useState<number>(10000);
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(3.0);
  const [chartViewMode, setChartViewMode] = useState<'balance' | 'outflows'>('balance');

  const settings: CashFlowSettings = {
    projectionMonths,
    initialCashBalance,
    monthlyGrowthRate,
    defaultReceivableLagDays: 30,
  };

  const { monthlyData, summary } = useMemo(() => {
    return generateCashFlowForecast(products, settings);
  }, [products, projectionMonths, initialCashBalance, monthlyGrowthRate]);

  // Formatted chart data
  const chartData = useMemo(() => {
    return monthlyData.map((m) => ({
      name: m.monthName.split(' ')[0],
      fullName: m.monthName,
      Faturamento: m.grossSalesInvoiced,
      Entradas: m.cashInflowReceived,
      Saidas: m.totalCashOutflow,
      SaldoAcumulado: m.cumulativeCashBalance,
      FluxoLiquido: m.netOperatingCash,
      Insumos: m.rawMaterialPayment,
      GGF: m.ggfPayment,
      FixosESalarios: m.fixedExpensesPayment,
      Impostos: m.taxesPayment,
      ComissoesETaxas: m.variablesAndCommissionsPayment,
    }));
  }, [monthlyData]);

  const hasNegativeBalance = summary.minimumCashBalance < 0;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-950">Painel de Fluxo de Caixa Previsto</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Projeção dinâmica de entradas, saídas (GGF, impostos, insumos) e necessidade de capital de giro
          </p>
        </div>

        {/* Quick Simulation Parameters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Months selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-medium">Período:</span>
            <select
              id="cashflow-months-select"
              value={projectionMonths}
              onChange={(e) => setProjectionMonths(parseInt(e.target.value))}
              className="bg-transparent text-slate-900 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value={3}>3 Meses</option>
              <option value={6}>6 Meses</option>
              <option value={12}>12 Meses</option>
            </select>
          </div>

          {/* Initial Balance */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-medium">Caixa Inicial:</span>
            <span className="text-slate-500 font-mono font-bold">R$</span>
            <input
              id="initial-cash-input"
              type="number"
              value={initialCashBalance}
              onChange={(e) => setInitialCashBalance(parseFloat(e.target.value) || 0)}
              className="w-24 bg-transparent text-slate-900 font-mono font-black focus:outline-hidden text-right"
              placeholder="0"
            />
          </div>

          {/* Growth Rate */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-medium">Crescimento:</span>
            <input
              id="growth-rate-input"
              type="number"
              step="0.5"
              value={monthlyGrowthRate}
              onChange={(e) => setMonthlyGrowthRate(parseFloat(e.target.value) || 0)}
              className="w-14 bg-transparent text-slate-900 font-mono font-black focus:outline-hidden text-right"
            />
            <span className="text-slate-500 font-bold">% a.m.</span>
          </div>

          {/* Export CSV */}
          <button
            id="export-cashflow-csv-btn"
            onClick={() => exportCashFlowToCSV(monthlyData)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Fluxo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Entradas Totais */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white p-6 rounded-3xl border border-emerald-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Recebimentos Previstos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shadow-xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-700 font-mono tracking-tight">
            {formatCurrencyBRL(summary.totalInflow)}
          </div>
          <div className="mt-1.5 text-xs font-medium text-slate-600">
            Faturamento Faturado: <span className="font-mono text-slate-900 font-bold">{formatCurrencyBRL(summary.totalRevenue)}</span>
          </div>
        </div>

        {/* KPI 2: Saídas Totais */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-50/40 to-white p-6 rounded-3xl border border-rose-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Total de Desembolsos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100/90 text-rose-700 flex items-center justify-center shadow-xs">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-700 font-mono tracking-tight">
            {formatCurrencyBRL(summary.totalOutflow)}
          </div>
          <div className="mt-1.5 text-xs font-medium text-slate-600">
            Insumos, GGF, tributos e fixos
          </div>
        </div>

        {/* KPI 3: Saldo Operacional Líquido */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-50/40 to-white p-6 rounded-3xl border border-indigo-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              Geração de Caixa Líquida
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              summary.netOperatingCash >= 0 ? 'bg-indigo-100/90 text-indigo-700' : 'bg-rose-100/90 text-rose-700'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`mt-3 text-3xl font-black font-mono tracking-tight ${
            summary.netOperatingCash >= 0 ? 'text-indigo-700' : 'text-rose-700'
          }`}>
            {formatCurrencyBRL(summary.netOperatingCash)}
          </div>
          <div className="mt-1.5 text-xs font-medium text-slate-600">
            Saldo acumulado final: <span className="font-mono font-bold text-slate-900">{formatCurrencyBRL(summary.finalCashBalance)}</span>
          </div>
        </div>

        {/* KPI 4: Necessidade de Capital de Giro */}
        <div className={`p-6 rounded-3xl border shadow-sm ${
          hasNegativeBalance 
            ? 'bg-gradient-to-br from-rose-500/15 via-rose-50/60 to-white border-rose-300' 
            : 'bg-gradient-to-br from-teal-500/10 via-teal-50/40 to-white border-teal-200/90'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              hasNegativeBalance ? 'text-rose-800' : 'text-teal-800'
            }`}>
              Necessidade Capital de Giro
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              hasNegativeBalance ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'
            }`}>
              {hasNegativeBalance ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>
          <div className={`mt-3 text-3xl font-black font-mono tracking-tight ${
            hasNegativeBalance ? 'text-rose-700' : 'text-teal-700'
          }`}>
            {formatCurrencyBRL(summary.workingCapitalNeed)}
          </div>
          <div className="mt-1.5 text-xs font-semibold">
            {hasNegativeBalance ? (
              <span className="text-rose-700">Atenção: déficit de caixa projetado</span>
            ) : (
              <span className="text-teal-700">Caixa positivo em todos os períodos</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-950 text-lg">
              {chartViewMode === 'balance' ? 'Entradas vs Saídas & Saldo de Caixa Acumulado' : 'Composição Detalhada das Saídas de Caixa'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {chartViewMode === 'balance' 
                ? 'Barras representam o fluxo do mês; a linha roxa representa o saldo bancário acumulado.' 
                : 'Detalhamento mensal dos desembolsos por categoria (insumos, GGF, salários, tributos).'}
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setChartViewMode('balance')}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                chartViewMode === 'balance' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Visão Fluxo Geral</span>
            </button>
            <button
              onClick={() => setChartViewMode('outflows')}
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                chartViewMode === 'outflows' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-4 h-4 text-purple-600" />
              <span>Detalhamento de Saídas</span>
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-88 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartViewMode === 'balance' ? (
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrencyBRL(Number(value)), '']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
                <Bar dataKey="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={42} name="Entradas (Recebidas)" />
                <Bar dataKey="Saidas" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={42} name="Saídas (Desembolsos)" />
                <Line 
                  type="monotone" 
                  dataKey="SaldoAcumulado" 
                  stroke="#6366f1" 
                  strokeWidth={3.5} 
                  dot={{ r: 5, fill: '#6366f1' }} 
                  name="Saldo de Caixa Acumulado" 
                />
              </ComposedChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrencyBRL(Number(value)), '']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} />
                <Area type="monotone" dataKey="Insumos" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="Insumos / Fornecedores" />
                <Area type="monotone" dataKey="GGF" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.8} name="GGF / Fábrica" />
                <Area type="monotone" dataKey="FixosESalarios" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.8} name="Despesas Fixas & M.O." />
                <Area type="monotone" dataKey="Impostos" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.8} name="Impostos Pagos" />
                <Area type="monotone" dataKey="ComissoesETaxas" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} name="Comissões & Gateway" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Timeline Forecast Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Tabela Mês a Mês do Fluxo de Caixa Projetado
          </h3>
          <span className="text-xs sm:text-sm text-slate-500 font-mono font-bold">
            {monthlyData.length} meses projetados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm font-mono">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 font-sans">Mês</th>
                <th className="py-3.5 px-3 text-right font-sans">Vendas (un)</th>
                <th className="py-3.5 px-3 text-right">Faturamento Bruto</th>
                <th className="py-3.5 px-3 text-right text-emerald-700">Entradas (R$)</th>
                <th className="py-3.5 px-3 text-right text-blue-700">Insumos</th>
                <th className="py-3.5 px-3 text-right text-purple-700">GGF</th>
                <th className="py-3.5 px-3 text-right text-slate-600">Fixos + MO</th>
                <th className="py-3.5 px-3 text-right text-rose-600">Impostos</th>
                <th className="py-3.5 px-3 text-right text-amber-600">Comissões</th>
                <th className="py-3.5 px-3 text-right font-black text-rose-700">Total Saídas</th>
                <th className="py-3.5 px-3 text-right font-black text-slate-950">Resultado Mês</th>
                <th className="py-3.5 px-4 text-right font-black text-indigo-950 bg-indigo-50/70">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {monthlyData.map((m) => {
                const isPositiveMonth = m.netOperatingCash >= 0;
                const isPositiveCumulative = m.cumulativeCashBalance >= 0;

                return (
                  <tr key={m.monthIndex} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                      {m.monthName}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-700 font-medium">
                      {m.projectedUnits}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-800 font-medium">
                      {formatCurrencyBRL(m.grossSalesInvoiced)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-emerald-700 font-bold">
                      {formatCurrencyBRL(m.cashInflowReceived)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-blue-700">
                      {formatCurrencyBRL(m.rawMaterialPayment)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-purple-700">
                      {formatCurrencyBRL(m.ggfPayment)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-600">
                      {formatCurrencyBRL(m.fixedExpensesPayment)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-rose-600">
                      {formatCurrencyBRL(m.taxesPayment)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-amber-600">
                      {formatCurrencyBRL(m.variablesAndCommissionsPayment)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-rose-700 font-bold">
                      {formatCurrencyBRL(m.totalCashOutflow)}
                    </td>
                    <td className={`py-3.5 px-3 text-right font-bold ${
                      isPositiveMonth ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isPositiveMonth ? '+' : ''}{formatCurrencyBRL(m.netOperatingCash)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-black bg-indigo-50/40 ${
                      isPositiveCumulative ? 'text-indigo-950' : 'text-rose-700'
                    }`}>
                      {formatCurrencyBRL(m.cumulativeCashBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
