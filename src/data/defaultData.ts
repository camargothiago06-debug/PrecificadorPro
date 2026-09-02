import { ProductItem, AppSettings, RegisteredProductItem } from '../types';

export const initialAppSettings: AppSettings = {
  companyName: 'Indústria & Processamento Brasil',
  defaultTaxRegime: 'lucro_real',
  defaultSimplesRate: 6.5,
  defaultCardRate: 2.5,
  defaultCommissionRate: 4.0,
  defaultMonthlyFixedOverhead: 18500,
  defaultMonthlyGlobalVolume: 12000, // 12.000 kg/mês
  currency: 'BRL',
};

export const defaultProducts: ProductItem[] = [
  {
    id: 'prod-1',
    code: 'IND-PP-01',
    name: 'Composto Termoplástico PP Industrial 20% Fibra',
    category: 'Polímeros & Resinas',
    description: 'Polímero estrutural de alta resistência mecânica para injeção de autopeças e utilidades técnicas.',
    netWeightKg: 1.0, // 1 kg como unidade padrão
    unitOfMeasure: 'kg',
    targetSalesVolume: 4500, // 4.500 kg/mês
    factoryMonthlyKgCapacity: 15000, // Capacidade do parque fabril: 15.000 kg/mês
    directCosts: [
      { id: 'dc-1', name: 'Resina Polipropileno Virgem Base', category: 'raw_material', unit: 'kg', quantity: 0.78, unitCost: 8.90, totalCost: 6.942, hasTaxCredit: true },
      { id: 'dc-2', name: 'Fibra de Vidro Moída Especial', category: 'raw_material', unit: 'kg', quantity: 0.20, unitCost: 14.50, totalCost: 2.90, hasTaxCredit: true },
      { id: 'dc-3', name: 'Aditivos Antioxidantes & Pigmento Preto', category: 'raw_material', unit: 'kg', quantity: 0.02, unitCost: 32.00, totalCost: 0.64, hasTaxCredit: true },
      { id: 'dc-4', name: 'Saco Valvulado de Ráfia Industrial 25kg (pró-rata)', category: 'packaging', unit: 'kg', quantity: 1, unitCost: 0.18, totalCost: 0.18, hasTaxCredit: true },
      { id: 'dc-5', name: 'Mão de Obra Direta Operação Extrusora', category: 'direct_labor', unit: 'kg', quantity: 1, unitCost: 0.95, totalCost: 0.95 },
    ],
    ggfItems: [
      { id: 'ggf-1', name: 'Energia Elétrica Industrial das Extrusoras', category: 'energy', allocationType: 'rate_per_kg', value: 12000, calculatedUnitCost: 0.80, calculatedCostPerKg: 0.80, hasTaxCredit: true },
      { id: 'ggf-2', name: 'Aluguel do Galpão Industrial Rateado por kg', category: 'rent', allocationType: 'rate_per_kg', value: 9000, calculatedUnitCost: 0.60, calculatedCostPerKg: 0.60 },
      { id: 'ggf-3', name: 'Depreciação & Manutenção Preventiva do Maquinário', category: 'depreciation', allocationType: 'fixed_per_kg', value: 0.75, calculatedUnitCost: 0.75, calculatedCostPerKg: 0.75 },
      { id: 'ggf-4', name: 'Controle de Qualidade e Laboratório', category: 'supervision', allocationType: 'fixed_per_kg', value: 0.45, calculatedUnitCost: 0.45, calculatedCostPerKg: 0.45 },
    ],
    fixedExpenseAllocation: {
      monthlyFixedExpenses: 18000,
      estimatedMonthlyKgVolume: 15000, // 15.000 kg/mês
      estimatedMonthlyVolume: 15000,
      costPerKg: 1.20,
      costPerUnit: 1.20,
      allocationBasis: 'kg',
    },
    taxSettings: {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 18.0, // ICMS Venda 18%
      pis: 1.65, // PIS Não-Cumulativo 1.65%
      cofins: 7.60, // COFINS Não-Cumulativo 7.60%
      ipi: 5.0, // IPI 5%
      iss: 0,
      irpjCsll: 0,
      takeRawMaterialTaxCredits: true, // Créditos na entrada
      pisCreditRate: 1.65,
      cofinsCreditRate: 7.60,
      icmsCreditRate: 12.0, // Crédito médio ICMS insumos
      ipiCreditRate: 5.0,
      totalIrpjCsllRealRate: 34.0, // 34% sobre LAIR
      customTaxRate: 0,
      totalTaxRate: 32.25, // 18 + 1.65 + 7.6 + 5
    },
    variableExpenses: {
      salesCommissionRate: 3.5,
      cardGatewayRate: 0,
      marketplacePlatformRate: 0,
      shippingUnitCost: 0.60, // Frete rodoviário R$ 0,60/kg
      otherVariableRate: 1.0,
      totalVariableRate: 4.5,
    },
    desiredProfitMargin: 16.0, // 16% líquido por kg
    pricingMethod: 'markup_divisor',
    receivableDays: 60, // 30/60/90
    receivableTermsType: '30_60_90',
    receivableInstallments: [30, 60, 90],
    payableDays: 45, // 30/60
    payableTermsType: '30_60',
    payableInstallments: [30, 60],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    code: 'ALIM-MIX-02',
    name: 'Pré-Mistura Industrial para Panificação Premium',
    category: 'Indústria Alimentícia',
    description: 'Composto balanceado de farinhas enriquecidas, enzimas ativas e emulsificantes para panificação industrial.',
    netWeightKg: 1.0,
    unitOfMeasure: 'kg',
    targetSalesVolume: 8000, // 8.000 kg/mês
    factoryMonthlyKgCapacity: 25000, // Capacidade: 25.000 kg/mês
    directCosts: [
      { id: 'dc-201', name: 'Farinha de Trigo Especial Tipo 1', category: 'raw_material', unit: 'kg', quantity: 0.82, unitCost: 3.40, totalCost: 2.788, hasTaxCredit: true },
      { id: 'dc-202', name: 'Complexo Enzimático & Melhoradores de Farinha', category: 'raw_material', unit: 'kg', quantity: 0.05, unitCost: 28.00, totalCost: 1.40, hasTaxCredit: true },
      { id: 'dc-203', name: 'Emulsificantes & Gordura Vegetal em Pó', category: 'raw_material', unit: 'kg', quantity: 0.08, unitCost: 18.50, totalCost: 1.48, hasTaxCredit: true },
      { id: 'dc-204', name: 'Açúcares Especiais e Sal Micronizado', category: 'raw_material', unit: 'kg', quantity: 0.05, unitCost: 4.20, totalCost: 0.21, hasTaxCredit: true },
      { id: 'dc-205', name: 'Embalagem Kraft Multifolhada com Barreira (pró-rata)', category: 'packaging', unit: 'kg', quantity: 1, unitCost: 0.15, totalCost: 0.15, hasTaxCredit: true },
      { id: 'dc-206', name: 'Mão de Obra de Mistura e Ensaque', category: 'direct_labor', unit: 'kg', quantity: 1, unitCost: 0.42, totalCost: 0.42 },
    ],
    ggfItems: [
      { id: 'ggf-201', name: 'Energia Elétrica dos Moinhos e Misturadores', category: 'energy', allocationType: 'fixed_per_kg', value: 0.45, calculatedUnitCost: 0.45, calculatedCostPerKg: 0.45, hasTaxCredit: true },
      { id: 'ggf-202', name: 'Higienização Sanitária & Laudos Microbiológicos', category: 'maintenance', allocationType: 'fixed_per_kg', value: 0.28, calculatedUnitCost: 0.28, calculatedCostPerKg: 0.28 },
      { id: 'ggf-203', name: 'Depreciação dos Silos e Linha Automatizada', category: 'depreciation', allocationType: 'rate_per_kg', value: 7500, calculatedUnitCost: 0.30, calculatedCostPerKg: 0.30 },
    ],
    fixedExpenseAllocation: {
      monthlyFixedExpenses: 15000,
      estimatedMonthlyKgVolume: 25000, // 25.000 kg/mês
      estimatedMonthlyVolume: 25000,
      costPerKg: 0.60,
      costPerUnit: 0.60,
      allocationBasis: 'kg',
    },
    taxSettings: {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 12.0, // ICMS 12%
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
      totalTaxRate: 21.25, // 12 + 1.65 + 7.6
    },
    variableExpenses: {
      salesCommissionRate: 2.5,
      cardGatewayRate: 0,
      marketplacePlatformRate: 0,
      shippingUnitCost: 0.40, // Frete R$ 0,40/kg
      otherVariableRate: 1.0,
      totalVariableRate: 3.5,
    },
    desiredProfitMargin: 18.0,
    pricingMethod: 'markup_divisor',
    receivableDays: 45,
    receivableTermsType: '30_60',
    receivableInstallments: [30, 60],
    payableDays: 30,
    payableTermsType: '30d',
    payableInstallments: [30],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    code: 'QUIM-DET-03',
    name: 'Detergente Industrial Alcalino Concentrado',
    category: 'Química & Sanitizantes',
    description: 'Detergente desengraxante industrial biodegradável para limpeza pesada CIP e superfícies industriais.',
    netWeightKg: 1.0,
    unitOfMeasure: 'kg',
    targetSalesVolume: 3500, // 3.500 kg/mês
    factoryMonthlyKgCapacity: 10000, // Capacidade: 10.000 kg/mês
    directCosts: [
      { id: 'dc-301', name: 'Tensoativos Aniônicos & Não-Iônicos Concentrados', category: 'raw_material', unit: 'kg', quantity: 0.35, unitCost: 16.20, totalCost: 5.67, hasTaxCredit: true },
      { id: 'dc-302', name: 'Hidróxido de Sódio & Alcalinizantes', category: 'raw_material', unit: 'kg', quantity: 0.20, unitCost: 4.80, totalCost: 0.96, hasTaxCredit: true },
      { id: 'dc-303', name: 'Sequestrantes, Quelantes & Água Desmineralizada', category: 'raw_material', unit: 'kg', quantity: 0.45, unitCost: 1.10, totalCost: 0.495, hasTaxCredit: true },
      { id: 'dc-304', name: 'Tambor/Bombona PEAD 50kg Homologada (pró-rata)', category: 'packaging', unit: 'kg', quantity: 1, unitCost: 0.32, totalCost: 0.32, hasTaxCredit: true },
      { id: 'dc-305', name: 'Mão de Obra de Formulação e Envase', category: 'direct_labor', unit: 'kg', quantity: 1, unitCost: 0.55, totalCost: 0.55 },
    ],
    ggfItems: [
      { id: 'ggf-301', name: 'Estação de Tratamento de Efluentes (ETE) & Laudos Ambientais', category: 'maintenance', allocationType: 'fixed_per_kg', value: 0.65, calculatedUnitCost: 0.65, calculatedCostPerKg: 0.65 },
      { id: 'ggf-302', name: 'Energia Elétrica e Agitadores Pneumáticos', category: 'energy', allocationType: 'fixed_per_kg', value: 0.40, calculatedUnitCost: 0.40, calculatedCostPerKg: 0.40, hasTaxCredit: true },
      { id: 'ggf-303', name: 'Aluguel do Parque Fabril & Armazenagem Quimica', category: 'rent', allocationType: 'rate_per_kg', value: 5000, calculatedUnitCost: 0.50, calculatedCostPerKg: 0.50 },
    ],
    fixedExpenseAllocation: {
      monthlyFixedExpenses: 12000,
      estimatedMonthlyKgVolume: 10000, // 10.000 kg/mês
      estimatedMonthlyVolume: 10000,
      costPerKg: 1.20,
      costPerUnit: 1.20,
      allocationBasis: 'kg',
    },
    taxSettings: {
      regime: 'lucro_real',
      simplesRate: 0,
      icms: 18.0,
      pis: 1.65,
      cofins: 7.60,
      ipi: 5.0,
      iss: 0,
      irpjCsll: 0,
      takeRawMaterialTaxCredits: true,
      pisCreditRate: 1.65,
      cofinsCreditRate: 7.60,
      icmsCreditRate: 12.0,
      totalIrpjCsllRealRate: 34.0,
      customTaxRate: 0,
      totalTaxRate: 32.25,
    },
    variableExpenses: {
      salesCommissionRate: 4.0,
      cardGatewayRate: 0,
      marketplacePlatformRate: 0,
      shippingUnitCost: 0.50, // Frete R$ 0,50/kg
      otherVariableRate: 1.0,
      totalVariableRate: 5.0,
    },
    desiredProfitMargin: 20.0,
    pricingMethod: 'markup_divisor',
    receivableDays: 45,
    receivableTermsType: '30_60',
    receivableInstallments: [30, 60],
    payableDays: 30,
    payableTermsType: '30d',
    payableInstallments: [30],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const defaultRegisteredProducts: RegisteredProductItem[] = [
  {
    id: 'reg-prod-1',
    code: 'POL-PP-VIRG',
    name: 'Resina Polipropileno Virgem Homopolímero H-103',
    category: 'Polímeros & Resinas',
    unit: 'kg',
    defaultWeightKg: 1.0,
    totalPrice: 12.50,
    taxRate: 18.0, // 18% ICMS
    icmsRate: 18.0,
    pisRate: 1.65,
    cofinsRate: 7.60,
    ipiRate: 5.0,
    taxAmount: 2.25, // 12.50 * 18% = 2.25
    netPrice: 10.25, // 12.50 - 2.25 = 10.25
    description: 'Resina termoplástica virgem para extrusão e injeção de alta performance.',
    supplier: 'Braskem Distribuição',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg-prod-2',
    code: 'FIB-VID-MOID',
    name: 'Fibra de Vidro Moída Especial 1/16"',
    category: 'Cargas & Reforços',
    unit: 'kg',
    defaultWeightKg: 1.0,
    totalPrice: 16.80,
    taxRate: 12.0, // 12% Imposto interestadual
    icmsRate: 12.0,
    pisRate: 1.65,
    cofinsRate: 7.60,
    ipiRate: 3.25,
    taxAmount: 2.016,
    netPrice: 14.784,
    description: 'Fibra picada de alta pureza para reforço de impacto mecânico.',
    supplier: 'Owens Corning Brasil',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg-prod-3',
    code: 'PIG-MB-BLK',
    name: 'Masterbatch Preto Carbon Black Concentrado 40%',
    category: 'Aditivos & Pigmentos',
    unit: 'kg',
    defaultWeightKg: 1.0,
    totalPrice: 38.00,
    taxRate: 20.0,
    icmsRate: 18.0,
    pisRate: 1.65,
    cofinsRate: 7.60,
    ipiRate: 5.0,
    taxAmount: 7.60,
    netPrice: 30.40,
    description: 'Pigmento preto de alta dispersão com proteção UV.',
    supplier: 'Cabot Química',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg-prod-4',
    code: 'SOLV-CLEAN-01',
    name: 'Solvente Industrial Desengraxante Biodegradável',
    category: 'Químicos & Fluidos',
    unit: 'l',
    defaultWeightKg: 0.95,
    totalPrice: 22.00,
    taxRate: 15.0,
    taxAmount: 3.30,
    netPrice: 18.70,
    description: 'Solvente atóxico para desengraxe de peças de usinagem e matrizes.',
    supplier: 'Química Industrial Bandeirante',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg-prod-5',
    code: 'EMB-RAF-25KG',
    name: 'Saco Valvulado de Ráfia Laminada 25kg Personalizado',
    category: 'Embalagens',
    unit: 'un',
    defaultWeightKg: 0.12,
    totalPrice: 4.50,
    taxRate: 9.25, // PIS/COFINS
    taxAmount: 0.416,
    netPrice: 4.084,
    description: 'Embalagem resistente para grãos plásticos e compostos com válvula de enchimento.',
    supplier: 'Embalagens São Paulo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

