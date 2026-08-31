export interface PaymentTermOption {
  id: string;
  label: string;
  shortLabel: string;
  installments: number[];
  averageDays: number;
  description: string;
}

export const STANDARD_PAYMENT_TERMS: PaymentTermOption[] = [
  {
    id: 'a_vista',
    label: 'À vista (0 dias)',
    shortLabel: 'À vista',
    installments: [0],
    averageDays: 0,
    description: 'Recebimento/Pagamento integral no ato da venda ou compra.',
  },
  {
    id: '15d',
    label: '15 dias (1 parcela)',
    shortLabel: '15 dias',
    installments: [15],
    averageDays: 15,
    description: '1 parcela com vencimento em 15 dias.',
  },
  {
    id: '30d',
    label: '30 dias (1 parcela)',
    shortLabel: '30 dias',
    installments: [30],
    averageDays: 30,
    description: '1 parcela com vencimento em 30 dias (Média: 30 dias).',
  },
  {
    id: '30_60',
    label: '30 / 60 dias (2 parcelas)',
    shortLabel: '30/60 dias',
    installments: [30, 60],
    averageDays: 45, // (30 + 60) / 2
    description: '2 parcelas de 50% em 30 e 60 dias (Média: 45 dias).',
  },
  {
    id: '30_60_90',
    label: '30 / 60 / 90 dias (3 parcelas)',
    shortLabel: '30/60/90 dias',
    installments: [30, 60, 90],
    averageDays: 60, // (30 + 60 + 90) / 3
    description: '3 parcelas de 33,3% em 30, 60 e 90 dias (Média: 60 dias).',
  },
  {
    id: '30_60_90_120',
    label: '30 / 60 / 90 / 120 dias (4 parcelas)',
    shortLabel: '30/60/90/120 dias',
    installments: [30, 60, 90, 120],
    averageDays: 75, // (30 + 60 + 90 + 120) / 4
    description: '4 parcelas de 25% em 30, 60, 90 e 120 dias (Média: 75 dias).',
  },
  {
    id: '30_60_90_120_150',
    label: '30 / 60 / 90 / 120 / 150 dias (5 parcelas)',
    shortLabel: '30/60/90/120/150 dias',
    installments: [30, 60, 90, 120, 150],
    averageDays: 90, // (30+60+90+120+150)/5
    description: '5 parcelas de 20% em 30, 60, 90, 120 e 150 dias (Média: 90 dias).',
  },
  {
    id: '30_60_90_120_150_180',
    label: '30 / 60 / 90 / 120 / 150 / 180 dias (6 parcelas)',
    shortLabel: '30/60/90/120/150/180 dias',
    installments: [30, 60, 90, 120, 150, 180],
    averageDays: 105, // (30+60+90+120+150+180)/6
    description: '6 parcelas em até 180 dias (Média: 105 dias).',
  },
  {
    id: '0_30_60',
    label: 'Entrada + 30 / 60 dias (3 parcelas)',
    shortLabel: 'Entrada + 30/60d',
    installments: [0, 30, 60],
    averageDays: 30, // (0 + 30 + 60) / 3
    description: '1/3 no ato + 1/3 em 30 dias + 1/3 em 60 dias (Média: 30 dias).',
  },
  {
    id: '0_30_60_90',
    label: 'Entrada + 30 / 60 / 90 dias (4 parcelas)',
    shortLabel: 'Entrada + 30/60/90d',
    installments: [0, 30, 60, 90],
    averageDays: 45, // (0 + 30 + 60 + 90) / 4
    description: '1/4 no ato + 1/4 em 30d + 1/4 em 60d + 1/4 em 90d (Média: 45 dias).',
  },
  {
    id: 'custom',
    label: 'Personalizado (informar prazos)',
    shortLabel: 'Personalizado',
    installments: [],
    averageDays: 0,
    description: 'Defina os dias de cada parcela (ex: 20/40/60 ou 14/28/42).',
  },
];

/**
 * Calcula a média aritmética dos dias das parcelas
 */
export function calculateAverageDays(installments: number[]): number {
  if (!installments || installments.length === 0) return 0;
  const sum = installments.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  return Math.round((sum / installments.length) * 10) / 10;
}

/**
 * Converte uma string no formato "30/60/90" ou "30, 60, 90" em array de números
 */
export function parseCustomTermsString(input: string): number[] {
  if (!input || !input.trim()) return [0];
  const parts = input
    .split(/[\/,;\-\s]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => parseInt(p, 10))
    .filter((n) => !isNaN(n) && n >= 0);

  return parts.length > 0 ? parts : [0];
}

/**
 * Formata um array de parcelas ou preset para exibição amigável
 * Ex: [30, 60, 90] => "30/60/90d (60d méd)"
 */
export function formatTermDisplay(
  termsTypeOrInstallments?: string | number[],
  installmentsOrFallback?: number[] | number,
  fallbackDays?: number
): string {
  // If first arg is array of numbers
  if (Array.isArray(termsTypeOrInstallments) && termsTypeOrInstallments.length > 0) {
    const avg = calculateAverageDays(termsTypeOrInstallments);
    if (termsTypeOrInstallments.length === 1 && termsTypeOrInstallments[0] === 0) {
      return 'À vista (0d)';
    }
    return `${termsTypeOrInstallments.join('/')}d (${avg}d méd)`;
  }

  // If second arg is array of numbers
  if (Array.isArray(installmentsOrFallback) && installmentsOrFallback.length > 0) {
    const avg = calculateAverageDays(installmentsOrFallback);
    if (installmentsOrFallback.length === 1 && installmentsOrFallback[0] === 0) {
      return 'À vista (0d)';
    }
    return `${installmentsOrFallback.join('/')}d (${avg}d méd)`;
  }

  // If first arg is string preset id
  if (typeof termsTypeOrInstallments === 'string') {
    const preset = STANDARD_PAYMENT_TERMS.find((t) => t.id === termsTypeOrInstallments);
    if (preset && preset.id !== 'custom') {
      return `${preset.shortLabel} (${preset.averageDays}d méd)`;
    }
  }

  const d = typeof installmentsOrFallback === 'number' ? installmentsOrFallback : (fallbackDays ?? 0);
  if (d === 0) return 'À vista (0d)';
  return `${d} dias`;
}

/**
 * Retorna as parcelas associadas a um preset ou valor customizado
 */
export function getInstallmentsForPreset(presetId: string, customInput?: string): number[] {
  const found = STANDARD_PAYMENT_TERMS.find((t) => t.id === presetId);
  if (found && found.id !== 'custom') {
    return found.installments;
  }
  if (customInput) {
    return parseCustomTermsString(customInput);
  }
  return [0];
}
