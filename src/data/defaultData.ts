import { ProductItem, AppSettings } from '../types';

export const initialAppSettings: AppSettings = {
  companyName: 'Minha Empresa & Indústria',
  defaultTaxRegime: 'lucro_real',
  defaultSimplesRate: 6.5,
  defaultCardRate: 3.0,
  defaultCommissionRate: 5.0,
  defaultMonthlyFixedOverhead: 5500,
  defaultMonthlyGlobalVolume: 400,
  currency: 'BRL',
};

export const defaultProducts: ProductItem[] = [
  {
    id: 'prod-1',
    code: 'IND-001',
    name: 'Bolsa Executiva de Couro Legítimo',
    category: 'Manufatura & Indústria',
    description: 'Bolsa estruturada em couro legítimo bovino com forro acetinado e metais dourados.',
    netWeightKg: 1.25, // 1.25 kg por unidade
    unitOfMeasure: 'un',
    targetSalesVolume: 80,
    factoryMonthlyKgCapacity: 600, // 600 kg/mês capacidade da fábrica
    directCosts: [
      { id: 'dc-1', name: 'Couro Bovino Premium (m²)', category: 'raw_material', unit: 'm²', quantity: 0.85, unitCost: 85.00, totalCost: 72.25, hasTaxCredit: true },
      { id: 'dc-2', name: 'Forro Jacquard / Cetim', category: 'raw_material', unit: 'm', quantity: 0.90, unitCost: 18.00, totalCost: 16.20, hasTaxCredit: true },
      { id: 'dc-3', name: 'Metais (Zíper, Mosquetão, Rebites)', category: 'raw_material', unit: 'kit', quantity: 1, unitCost: 19.50, totalCost: 19.50, hasTaxCredit: true },
      { id: 'dc-4', name: 'Caixa Rígida & Saco TNT Protetor', category: 'packaging', unit: 'un', quantity: 1, unitCost: 12.00, totalCost: 12.00, hasTaxCredit: true },
      { id: 'dc-5', name: 'Mão de Obra Direta (Corte e Costura 2.5h)', category: 'direct_labor', unit: 'horas', quantity: 2.5, unitCost: 24.00, totalCost: 60.00 },
    ],
    ggfItems: [
      { id: 'ggf-1', name: 'Energia Elétrica das Máquinas de Costura', category: 'energy', allocationType: 'rate_per_kg', value: 3600, calculatedUnitCost: 7.50, hasTaxCredit: true },
      { id: 'ggf-2', name: 'Aluguel do Ateliê/Galpão Rateado por kg', category: 'rent', allocationType: 'rate_per_kg', value: 7200, calculatedUnitCost: 15.00 },
      { id: 'ggf-3', name: 'Depreciação & Manutenção Maquinário', category: 'depreciation', allocationType: 'fixed_per_kg', value: 3.60, calculatedUnitCost: 4.50 },
      { id: 'ggf-4', name: 'Supervisão de Produção e Qualidade', category: 'supervision', allocationType: 'fixed_per_kg', value: 2.88, calculatedUnitCost: 3.60 },
    ],
    fixedExpenseAllocation: {
      monthlyFixedExpenses: 4500,
      estimatedMonthlyKgVolume: 375, // 300 un x 1.25 kg = 375 kg
      estimatedMonthlyVolume: 300,
      costPerKg: 12.00,
      costPerUnit: 15.00,
      allocationBasis: 'kg',
    },
    taxSettings: {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 18.0, // ICMS Venda 18%
      pis: 1.65, // PIS Não-Cumulativo 1.65%
      cofins: 7.60, // COFINS Não-Cumulativo 7.60%
      ipi: 5.0, // IPI Indústria 5%
      iss: 0,
      irpjCsll: 0,
      takeRawMaterialTaxCredits: true, // Aproveitamento de Créditos Fiscais na Entrada
      pisCreditRate: 1.65,
      cofinsCreditRate: 7.60,
      icmsCreditRate: 12.0, // Crédito médio ICMS insumos
      ipiCreditRate: 5.0,
      totalIrpjCsllRealRate: 34.0, // 34% (15%+10% IRPJ + 9% CSLL sobre Lucro Real)
      customTaxRate: 0,
      totalTaxRate: 32.25, // 18% + 1.65% + 7.60% + 5%
    },
    variableExpenses: {
      salesCommissionRate: 4.0,
      cardGatewayRate: 2.8,
      marketplacePlatformRate: 0,
      shippingUnitCost: 0,
      otherVariableRate: 1.0,
      totalVariableRate: 7.8,
    },
    desiredProfitMargin: 20.0, // 20% de margem líquida real final
    pricingMethod: 'markup_divisor',
    receivableDays: 60, // Média de 30/60/90 = 60 dias
    receivableTermsType: '30_60_90',
    receivableInstallments: [30, 60, 90],
    payableDays: 45, // Média de 30/60 = 45 dias
    payableTermsType: '30_60',
    payableInstallments: [30, 60],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    code: 'IND-002',
    name: 'Linha de Panificação & Tortas Gourmet 1.5kg',
    category: 'Indústria Alimentícia',
    description: 'Produto alimentício de fabricação industrial com insumos primários e cadeia fria.',
    netWeightKg: 1.50, // 1.5 kg por unidade
    unitOfMeasure: 'kg',
    targetSalesVolume: 180,
    factoryMonthlyKgCapacity: 1200, // 1200 kg/mês capacidade total
    directCosts: [
      { id: 'dc-201', name: 'Laticínios & Insumos Base', category: 'raw_material', unit: 'kit', quantity: 1, unitCost: 22.80, totalCost: 22.80, hasTaxCredit: true },
      { id: 'dc-202', name: 'Ingredientes Nobres & Chocolates', category: 'raw_material', unit: 'g', quantity: 300, unitCost: 0.06, totalCost: 18.00, hasTaxCredit: true },
      { id: 'dc-203', name: 'Farinha, Ovos e Fermentos Especiais', category: 'raw_material', unit: 'receita', quantity: 1, unitCost: 10.50, totalCost: 10.50, hasTaxCredit: true },
      { id: 'dc-204', name: 'Embalagem Rígida Termoselada com Barreira', category: 'packaging', unit: 'un', quantity: 1, unitCost: 4.50, totalCost: 4.50, hasTaxCredit: true },
      { id: 'dc-205', name: 'Mão de Obra de Produção (1h)', category: 'direct_labor', unit: 'horas', quantity: 1.0, unitCost: 22.00, totalCost: 22.00 },
    ],
    ggfItems: [
      { id: 'ggf-201', name: 'Gás Industrial & Forno Elétrico Contínuo', category: 'energy', allocationType: 'fixed_per_kg', value: 3.20, calculatedUnitCost: 4.80, hasTaxCredit: true },
      { id: 'ggf-202', name: 'Água Industrial e Higienização Sanitária', category: 'maintenance', allocationType: 'fixed_per_kg', value: 1.3333, calculatedUnitCost: 2.00 },
      { id: 'ggf-203', name: 'Depreciação de Câmaras Frias e Misturadores', category: 'depreciation', allocationType: 'rate_per_kg', value: 2000, calculatedUnitCost: 2.50 },
    ],
    fixedExpenseAllocation: {
      monthlyFixedExpenses: 3800,
      estimatedMonthlyKgVolume: 525, // 350 un x 1.5 kg = 525 kg
      estimatedMonthlyVolume: 350,
      costPerKg: 7.238,
      costPerUnit: 10.85,
      allocationBasis: 'kg',
    },
    taxSettings: {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 12.0, // ICMS cesta / produtos alimentícios
      pis: 1.65,
      cofins: 7.60,
      ipi: 0, // Isento IPI
      iss: 0,
      irpjCsll: 0,
      takeRawMaterialTaxCredits: true,
      pisCreditRate: 1.65,
      cofinsCreditRate: 7.60,
      icmsCreditRate: 12.0,
      totalIrpjCsllRealRate: 34.0,
      customTaxRate: 0,
      totalTaxRate: 21.25, // 12% + 1.65% + 7.60%
    },
    variableExpenses: {
      salesCommissionRate: 3.0,
      cardGatewayRate: 2.2,
      marketplacePlatformRate: 0,
      shippingUnitCost: 0,
      otherVariableRate: 1.0,
      totalVariableRate: 6.2,
    },
    desiredProfitMargin: 18.0,
    pricingMethod: 'markup_divisor',
    receivableDays: 45, // Média de 30/60 = 45 dias
    receivableTermsType: '30_60',
    receivableInstallments: [30, 60],
    payableDays: 30, // 30 dias
    payableTermsType: '30d',
    payableInstallments: [30],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    code: 'COM-003',
    name: 'Kit Teclado Mecânico RGB Wireless Switch Red',
    category: 'Comércio / Distribuição',
    description: 'Teclado mecânico compacto 75% hot-swappable para produtividade e jogos.',
    netWeightKg: 0.85, // 0.85 kg por unidade
    unitOfMeasure: 'un',
    targetSalesVolume: 120,
    factoryMonthlyKgCapacity: 500,
    directCosts: [
      { id: 'dc-301', name: 'Custo de Aquisição com Fornecedor Nacional', category: 'raw_material', unit: 'un', quantity: 1, unitCost: 145.00, totalCost: 145.00, hasTaxCredit: true },
      { id: 'dc-302', name: 'Caixa de Envio Reforçada + Fita Gomada', category: 'packaging', unit: 'un', quantity: 1, unitCost: 4.80, totalCost: 4.80, hasTaxCredit: true },
      { id: 'dc-303', name: 'Etiquetagem, Conferência e Teste de Bancada', category: 'direct_labor', unit: 'horas', quantity: 0.25, unitCost: 20.00, totalCost: 5.00 },
    ],
    ggfItems: [
      { id: 'ggf-301', name: 'Espaço de Armazenagem & Estoque Rateado', category: 'rent', allocationType: 'fixed_per_kg', value: 4.1176, calculatedUnitCost: 3.50 },
      { id: 'ggf-302', name: 'Sistemas ERP e Impressora Térmica', category: 'depreciation', allocationType: 'fixed_per_kg', value: 2.3529, calculatedUnitCost: 2.00 },
    ],
    fixedExpenseAllocation: {
      monthlyFixedExpenses: 4200,
      estimatedMonthlyKgVolume: 340, // 400 un x 0.85 kg = 340 kg
      estimatedMonthlyVolume: 400,
      costPerKg: 12.35,
      costPerUnit: 10.50,
      allocationBasis: 'kg',
    },
    taxSettings: {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 18.0,
      pis: 1.65,
      cofins: 7.60,
      ipi: 0,
      iss: 0,
      irpjCsll: 0,
      takeRawMaterialTaxCredits: true,
      pisCreditRate: 1.65,
      cofinsCreditRate: 7.60,
      icmsCreditRate: 12.0,
      totalIrpjCsllRealRate: 34.0,
      customTaxRate: 0,
      totalTaxRate: 27.25, // 18% + 1.65% + 7.60%
    },
    variableExpenses: {
      salesCommissionRate: 2.0,
      cardGatewayRate: 0,
      marketplacePlatformRate: 14.0, // Taxa do Marketplace
      shippingUnitCost: 18.50, // Frete grátis subsidiado
      otherVariableRate: 1.0,
      totalVariableRate: 17.0,
    },
    desiredProfitMargin: 15.0,
    pricingMethod: 'markup_divisor',
    receivableDays: 75, // Média de 30/60/90/120 = 75 dias
    receivableTermsType: '30_60_90_120',
    receivableInstallments: [30, 60, 90, 120],
    payableDays: 60, // Média de 30/60/90 = 60 dias
    payableTermsType: '30_60_90',
    payableInstallments: [30, 60, 90],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
